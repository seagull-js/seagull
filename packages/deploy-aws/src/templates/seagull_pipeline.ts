import { SDK } from 'aws-cdk'
import { handleSSMSecret, SSMHandler } from '../aws_sdk_handler'
import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'
import { StageConfigParams } from '../types'

interface SeagullPipelineProps {
  appPath: string
  branch: string
  buildWorkers: 1 | 2 | 3 | 4
  computeTypeSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  excludedPages?: string
  githubToken?: string
  poll: boolean
  profile: string
  owner?: string
  region: string
  repository?: string
  ssmParameter?: string
  stage: string
  handlers?: {
    ssmHandler?: SSMHandler
  }
  vpcId: string,
  subnetIds: string
}

export class SeagullPipeline {
  appPath: string
  branch: string
  computeTypeSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  owner?: string
  poll: boolean
  profile: string
  region: string
  repository?: string
  ssm: SSMHandler
  ssmParam?: string
  stage: string
  githubToken?: string
  actions: string[]
  buildWorkers: 1 | 2 | 3 | 4
  excludedPages?: string
  vpcId: string
  subnetIds: string

  constructor(props: SeagullPipelineProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.computeTypeSize = props.computeTypeSize
    this.stage = props.stage
    this.poll = props.poll
    this.profile = props.profile
    this.owner = props.owner
    this.region = props.region
    this.repository = props.repository
    this.ssmParam = props.ssmParameter
    this.githubToken = props.githubToken
    this.buildWorkers = props.buildWorkers
    const propsSSMHandler = props.handlers && props.handlers.ssmHandler
    this.ssm = propsSSMHandler || new SSMHandler()
    this.excludedPages = props.excludedPages
    this.vpcId = props.vpcId
    this.subnetIds = props.subnetIds
    this.actions = [
      'cloudformation:*',
      'cloudfront:*',
      'iam:*',
      's3:*',
      'ec2:*',
      'ssm:GetParameters',
      'apigateway:*',
      'lambda:*',
      'logs:*',
      'events:*',
    ]
  }

  async createPipeline() {
    setCredsByProfile(this.profile)
    // preparations for deployment
    const isTest = this.stage === 'test'
    const suffix = `${isTest ? `-${this.branch}-test` : ''}-ci`
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}`.replace(/[^0-9A-Za-z-]/g, '')
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
    const stackProps = { env: { account, region: this.region } }
    const props = { projectName: name, sdk, stackProps }
    const actions = this.actions

    // construct the stack and the app
    const pipelineApp = new SeagullApp(props)
    const stack = pipelineApp.stack
    const principal = 'codebuild.amazonaws.com'
    const role = stack.addIAMRole('role', principal, actions)
    const pipeline = stack.addPipeline('pipeline')
    const token = this.githubToken
    const tokenName = token ? `${name}-github` : this.ssmParam || undefined
    const secretParams = { ssmHandler: this.ssm, token, tokenName }
    const ssmSecret = await handleSSMSecret(secretParams)
    const gitDataProps = {
      branch: this.branch,
      owner: this.owner,
      pkg: pkgJson,
      repo: this.repository,
      secretParameter: ssmSecret.secret,
    }
    const gitData = lib.getGitData(gitDataProps)
    const pipelineDomain = `https://${this.region}.console.aws.amazon.com`
    const pipelinePath = `/codesuite/codepipeline/pipelines/${pipeline.id}/view`
    const pipelineLink = `${pipelineDomain}${pipelinePath}`
    const stageConfigParams: StageConfigParams = {
      branch: gitData.branch,
      buildWorkers: this.buildWorkers,
      computeTypeSize: this.computeTypeSize,
      excludedPages: this.excludedPages,
      owner: gitData.owner,
      pipeline,
      pipelineLink,
      poll: this.poll,
      repo: gitData.repo,
      role,
      ssmSecret,
      stage: this.stage,
      vpcId: this.vpcId,
      subnetIds: this.subnetIds
    }
    lib.addPipelineStages(stack, stageConfigParams)
    return pipelineApp
  }

  async deployPipeline() {
    const pipeline = await this.createPipeline()
    await pipeline.deployStack()
  }

  async destroyPipeline() {
    const pipeline = await this.createPipeline()
    await pipeline.destroyStack()
  }
}

import { SDK } from 'aws-cdk'

import { handleSSMSecret, SSMHandler } from '../handle_ssm_secret'
import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullPipelineProps {
  appPath: string
  branch: string
  githubToken?: string
  mode: string
  profile: string
  owner?: string
  region: string
  repository?: string
  ssmParameter?: string
  ssmHandler?: SSMHandler
}

export class SeagullPipeline {
  appPath: string
  branch: string
  mode: string
  owner?: string
  profile: string
  region: string
  repository?: string
  ssmHandler: SSMHandler
  ssmParam?: string
  githubToken?: string
  actions: string[]

  constructor(props: SeagullPipelineProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.profile = props.profile
    this.owner = props.owner
    this.region = props.region
    this.repository = props.repository
    this.ssmParam = props.ssmParameter
    this.githubToken = props.githubToken
    this.ssmHandler = props.ssmHandler || new SSMHandler()
    this.actions = [
      'cloudformation:*',
      'cloudfront:*',
      'iam:*',
      's3:*',
      'ssm:GetParameters',
      'apigateway:*',
      'lambda:*',
      'logs:*',
    ]
  }

  async createPipeline() {
    setCredsByProfile(this.profile)
    // preparations for deployment
    const isTest = this.mode === 'test'
    const suffix = `${isTest ? `-${this.branch}-test` : ''}-ci`
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}`
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
    const tokenName = this.ssmParam || token ? `${name}-github` : undefined
    const secretParams = { ssmHandler: this.ssmHandler, token, tokenName }
    const ssmSecret = await handleSSMSecret(secretParams)
    const gitDataProps = {
      branch: this.branch,
      mode: this.mode,
      owner: this.owner,
      pkg: pkgJson,
      repo: this.repository,
      secretParameter: ssmSecret.secret,
    }
    const gitData = lib.getGitData(gitDataProps)

    const stageConfigParams = {
      branch: gitData.branch,
      mode: this.mode,
      owner: gitData.owner,
      pipeline,
      repositoryName: gitData.repo,
      role,
      ssmSecret,
    }
    const stageConfigs = lib.getStageConfigs(stageConfigParams)

    stack.addSourceStage('source', stageConfigs.sourceConfig)
    stack.addBuildStage('build', stageConfigs.buildConfig)
    return pipelineApp
  }

  async deployPipeline() {
    const pipeline = await this.createPipeline()
    await pipeline.deployStack()
  }
}

import { Secret } from '@aws-cdk/cdk'
import { SDK } from 'aws-cdk'
import { config, SSM } from 'aws-sdk'

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
}

export class SeagullPipeline {
  appPath: string
  branch: string
  mode: string
  owner?: string
  profile: string
  region: string
  repository?: string
  ssmParam?: string
  githubToken?: string
  actions: string[]
  install: string[]
  build: string[]
  postBuild: string[]

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
    this.actions = [
      'cloudformation:*',
      'cloudfront:*',
      'iam:*',
      's3:*',
      'apigateway:*',
      'lambda:*',
      'logs:*',
    ]
    this.install = ['npm i -g npm', 'npm ci']
    this.build = ['npm run build']
    this.postBuild = [
      'npm run test',
      `BRANCH_NAME=${this.branch} DEPLOY_MODE=${this.mode} npm run deploy`,
    ]
  }

  async createPipeline() {
    setCredsByProfile(this.profile)
    // preparations for deployment
    const isTest = this.mode === 'test'
    const suffix = `${isTest ? `-${this.branch}-test` : ''}-pipeline`
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}`
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
    const projectName = name
    const stackProps = { env: { account, region: this.region } }
    const props = { projectName, sdk, stackProps }
    const actions = this.actions

    // construct the stack and the app
    const pipelineApp = new SeagullApp(props)
    const stack = pipelineApp.stack
    const principal = 'codebuild.amazonaws.com'
    const role = stack.addIAMRole('role-pipeline', principal, actions)
    const pipeline = stack.addPipeline('pipeline')
    const ssmSecret = this.ssmParam ? getSSMSecret(this.ssmParam) : undefined
    const gitDataProps = {
      branch: this.branch,
      owner: this.owner,
      pkg: pkgJson,
      repo: this.repository,
      secretParameter: await ssmSecret,
      token: this.githubToken,
    }
    const gitData = lib.getGitData(gitDataProps)
    const sourceConfig = {
      atIndex: 0,
      branch: gitData.branch,
      oauthToken: gitData.secret,
      owner: gitData.owner,
      pipeline,
      repo: gitData.repo,
    }
    stack.addSourceStage('source', sourceConfig)
    const buildConfig = {
      atIndex: 1,
      build: this.build,
      install: this.install,
      pipeline,
      postBuild: this.postBuild,
      role,
    }
    stack.addBuildStage('build', buildConfig)
    return pipelineApp
  }

  async deployPipeline() {
    const pipeline = await this.createPipeline()
    await pipeline.deployStack()
  }
}

async function getSSMSecret(parameter: string) {
  const ssm = new SSM({ credentials: config.credentials })
  const param = { Name: parameter, WithDecryption: true }
  const ssmParam = await ssm.getParameter(param).promise()
  const value = ssmParam && ssmParam.Parameter && ssmParam.Parameter.Value
  return value ? new Secret(value) : undefined
}

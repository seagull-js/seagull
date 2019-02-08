import { SDK } from 'aws-cdk'
import { STS } from 'aws-sdk'

import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'

interface SeagullPipelineProps {
  appPath: string
  branch: string
  mode: string
  owner?: string
  region: string
  repository?: string
  ssmParameter?: string
  githubToken?: string
}

export class SeagullPipeline {
  appPath: string
  branch: string
  owner?: string
  mode: string
  region: string
  repository?: string
  ssmParameter?: string
  githubToken?: string
  actions: string[]
  install: string[]
  build: string[]
  postBuild: string[]

  constructor(props: SeagullPipelineProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.owner = props.owner
    this.region = props.region
    this.repository = props.repository
    this.ssmParameter = props.ssmParameter
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
    // preparations for deployment
    const suffix = this.mode === 'test' ? `${this.branch}-test` : ''
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}-pipeline`
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
    const accountId = (await new STS().getCallerIdentity().promise()).Account
    const bucketProps = { accountId, project: name, region: this.region }
    const itemBucketName = lib.getItemsBucketName(bucketProps)
    const addAssets = false
    const itemsBucket = itemBucketName
    const projectName = name
    const stackProps = { env: { account, region: this.region } }
    const props = { addAssets, itemsBucket, projectName, sdk, stackProps }
    const actions = this.actions

    // construct the stack and the app
    const pipelineApp = new SeagullApp(props)
    const stack = pipelineApp.stack
    const principal = 'codebuild.amazonaws.com'
    const role = stack.addIAMRole('role-pipeline', principal, actions)
    const pipeline = stack.addPipeline('pipeline')
    const ssmStr = this.ssmParameter
    const secretP = ssmStr ? stack.addSecretParam('github', ssmStr) : undefined
    const gitDataProps = {
      branch: this.branch,
      owner: this.owner,
      pkg: pkgJson,
      repo: this.repository,
      secretParameter: secretP,
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

import { Secret } from '@aws-cdk/cdk'
import { STS } from 'aws-sdk'

import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'

interface SeagullProjectProps {
  account: string
  appPath: string
  branch: string
  git?: lib.GitProps
  mode: string
  region: string
}

export class SeagullPipeline {
  account: string
  appPath: string
  branch: string
  git?: lib.GitProps
  mode: string
  region: string

  constructor(props: SeagullProjectProps) {
    this.account = props.account
    this.appPath = props.appPath
    this.branch = props.branch
    this.git = props.git
    this.mode = props.mode
    this.region = props.region
  }

  async createPipeline() {
    // preparations for deployment
    const suffix = this.mode === 'test' ? `${this.branch}-test` : ''
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}`
    const gitData = lib.getGitData(this.branch, pkgJson, this.git)
    const accountId = (await new STS().getCallerIdentity().promise()).Account
    const bucketProps = { accountId, project: name, region: this.region }
    const itemBucketName = lib.getItemsBucketName(bucketProps)
    const addAssets = false
    const itemsBucket = itemBucketName
    const projectName = name
    const stackProps = { env: { account: this.account, region: this.region } }
    const props = { addAssets, itemsBucket, projectName, stackProps }
    const actions = []
    actions.push('cloudformation:*')
    actions.push('cloudfront:*')
    actions.push('iam:*')
    actions.push('s3:*')
    actions.push('apigateway:*')
    actions.push('lambda:*')
    actions.push('logs:*')

    const install = []
    install.push('npm i -g npm')
    install.push('npm ci')

    const build = []
    build.push('npm run build')

    const postBuild = []
    postBuild.push('npm run test')
    const deployEnv = `BRANCH_NAME=${this.branch} DEPLOY_MODE=${this.mode}`
    postBuild.push(`${deployEnv} NO_PROFILE_CHECK=true npm run deploy`)

    // construct the stack and the app
    const app = new SeagullApp(props)
    const principal = 'codebuild.amazonaws.com'
    const role = app.stack.addIAMRole('role-pipeline', principal, actions)
    const pipeline = app.stack.addPipeline('pipeline')
    const sourceConfig = {
      gitData,
      pipelineConfig: { pipeline, atIndex: 0 },
      secret: getSecret(app, this.git),
    }
    const buildConfig = {
      build,
      install,
      pipelineConfig: { pipeline, atIndex: 1 },
      postBuild,
      role,
    }
    app.stack.addSourceStage('source', sourceConfig)
    app.stack.addBuildStage('build', buildConfig)
    return app
  }

  async deploy() {
    const app = await this.createPipeline()
    await app.deployStack()
  }
}

function getSecret(app: SeagullApp, git?: lib.GitProps) {
  return getAuthTokenDirect(git) || getSecretParameter(app, git).value
}

function getSecretParameter(app: SeagullApp, git?: lib.GitProps) {
  const ssmParameter = git && git.ssmParameter
  return app.stack.addSecretParameter('GithubToken', ssmParameter || '')
}

function getAuthTokenDirect(git?: lib.GitProps) {
  return git && git.token && new Secret(git.token)
}

import { SDK } from 'aws-cdk'
import { handleSSMSecret, SSMHandler } from '../aws_sdk_handler'
import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullPipelineProps {
  appPath: string
  branch: string
  githubToken?: string
  profile: string
  owner?: string
  region: string
  repository?: string
  ssmParameter?: string
  stage: string
  handlers?: {
    ssmHandler?: SSMHandler
  }
}

export class SeagullPipeline {
  appPath: string
  branch: string
  owner?: string
  profile: string
  region: string
  repository?: string
  ssm: SSMHandler
  ssmParam?: string
  stage: string
  githubToken?: string
  actions: string[]

  constructor(props: SeagullPipelineProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.stage = props.stage
    this.profile = props.profile
    this.owner = props.owner
    this.region = props.region
    this.repository = props.repository
    this.ssmParam = props.ssmParameter
    this.githubToken = props.githubToken
    const propsSSMHandler = props.handlers && props.handlers.ssmHandler
    this.ssm = propsSSMHandler || new SSMHandler()
    this.actions = [
      'cloudformation:*',
      'cloudfront:*',
      'iam:*',
      's3:*',
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
    const stageConfigParams = {
      branch: gitData.branch,
      owner: gitData.owner,
      pipeline,
      pipelineLink,
      repo: gitData.repo,
      role,
      ssmSecret,
      stage: this.stage,
    }

    const sourceAction = stack.addSourceStage(
      'source',
      lib.getSourceConfig(stageConfigParams, 0)
    )
    stack.addBuildActionStage(
      'test',
      lib.getTestConfig(stageConfigParams, 1, sourceAction.outputArtifact)
    )
    const buildAction = stack.addBuildActionStage('build', {
      ...lib.getBuildConfig(stageConfigParams, 2, sourceAction.outputArtifact),
      outputArtifacts: {
        'secondary-artifacts': {
          build: {
            files: '**/*',
            name: 'build',
          },
          dist: {
            files: ['dist/**/*'],
            name: 'dist',
          },
        },
      },
    })
    const deployAction = stack.addBuildActionStage('deploy', {
      ...lib.getDeployConfig(stageConfigParams, 3, sourceAction.outputArtifact),
      additionalInputArtifacts: [buildAction.additionalOutputArtifact('dist')],
      outputArtifacts: {
        'secondary-artifacts': {
          cfurl: {
            files: ['/tmp/cfurl.txt'],
            name: 'cfurl',
          },
          deploy: {
            files: '**/*',
            name: 'deploy',
          },
        },
      },
    })
    stack.addBuildActionStage('end2end-test', {
      ...lib.getTestEnd2EndConfig(
        stageConfigParams,
        4,
        sourceAction.outputArtifact
      ),
      additionalInputArtifacts: [
        deployAction.additionalOutputArtifact('cfurl'),
      ],
    })
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

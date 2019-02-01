import { App, Secret, Stack, StackProps } from '@aws-cdk/cdk'

import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway'
import * as CF from '@aws-cdk/aws-cloudfront'
import * as CB from '@aws-cdk/aws-codebuild'
import { GitHubSourceAction, Pipeline } from '@aws-cdk/aws-codepipeline'
import * as IAM from '@aws-cdk/aws-iam'
import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { LogGroup } from '@aws-cdk/aws-logs'
import * as S3 from '@aws-cdk/aws-s3'
import { getApiGatewayDomain, getApiGatewayPath } from './lib'

/**
 * The Seagull Stack - including convenience functions to add resources
 *
 */

export class SeagullStack extends Stack {
  constructor(app: App, projectName: string, stackProps?: StackProps) {
    super(app, projectName, stackProps)
  }

  addLogGroup(logGroupName: string) {
    const retentionDays = Infinity
    const props = { logGroupName, retentionDays }
    return new LogGroup(this, `${this.id}-${logGroupName}`, props)
  }

  addS3(bucketName: string, role?: IAM.IPrincipal) {
    const s3Props = { bucketName }
    const bucket = new S3.Bucket(this, `${this.id}-${bucketName}`, s3Props)
    // tslint:disable-next-line:no-unused-expression
    role && bucket.grantReadWrite(role)
    return bucket
  }

  addUniversalLambda(lambdaName: string, folder: string, role: IAM.Role) {
    const name = `${this.id}-${lambdaName}`
    const conf = {
      code: Code.asset(`${folder}/.seagull/deploy`),
      description: 'universal route',
      environment: { MODE: 'cloud' },
      functionName: `${name}-handler`,
      handler: 'dist/assets/backend/lambda.handler',
      memorySize: 1536,
      role,
      runtime: Runtime.NodeJS810,
      timeout: 300,
    }
    return new LambdaFunction(this, name, conf)
  }

  addUniversalApiGateway(gatewayName: string, lambda: LambdaFunction) {
    const name = `${this.id}-${gatewayName}`
    const defaultIntegration = new LambdaIntegration(lambda)
    const conf = { binaryMediaTypes: ['*/*'] }
    const apiGateway = new RestApi(this, name, conf)
    const proxy = apiGateway.root.addResource('{any+}')
    apiGateway.root.addMethod('GET', defaultIntegration)
    apiGateway.root.addMethod('POST', defaultIntegration)
    apiGateway.root.addMethod('DELETE', defaultIntegration)
    proxy.addMethod('GET', defaultIntegration)
    proxy.addMethod('POST', defaultIntegration)
    proxy.addMethod('DELETE', defaultIntegration)
    return apiGateway
  }

  addIAMRole(roleName: string, principleName: string, actions: string[]) {
    const name = `${this.id}-${roleName}`
    const roleParams = { assumedBy: new IAM.ServicePrincipal(principleName) }
    const role = new IAM.Role(this, name, roleParams)
    const policyStatement = new IAM.PolicyStatement()
    // TODO: add actions directly to the resources that need it
    role.addToPolicy(policyStatement.addAllResources().addActions(...actions))
    return role
  }

  addCloudfront(cfdName: string, apiGateway: RestApi) {
    const name = `${this.id}${cfdName}`
    const domainName = getApiGatewayDomain(apiGateway.url)
    const originPath = getApiGatewayPath(apiGateway.url)
    const allowedMethods = CF.CloudFrontAllowedMethods.ALL
    const forwardedValues = { headers: ['authorization'], queryString: true }
    const isDefaultBehavior = true
    const behaviors = [{ allowedMethods, forwardedValues, isDefaultBehavior }]
    const customOriginSource = { domainName }
    const originConfigs = [{ behaviors, customOriginSource, originPath }]
    const conf = { comment: this.id, defaultRootObject: '', originConfigs }
    return new CF.CloudFrontWebDistribution(this, name, conf)
  }

  addPipeline(pipelineName: string) {
    return new Pipeline(this, pipelineName, { pipelineName })
  }

  addSourceStage(name: string, pipelineConf: PipelineConfig, gitData: GitData) {
    const { atIndex, pipeline } = pipelineConf
    const sourceConfig = {
      branch: gitData.branch,
      oauthToken: gitData.oauthToken,
      owner: gitData.owner,
      repo: gitData.repo,
      stage: pipeline.addStage(`${name}Stage`, { placement: { atIndex } }),
    }
    return new GitHubSourceAction(this, `${name}GitHubSource`, sourceConfig)
  }

  addBuildStage(name: string, pipelineConf: PipelineConfig, cmds: BuildConfig) {
    const placement = { atIndex: pipelineConf.atIndex }
    const buildImage = CB.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
    const phases = {
      build: { commands: cmds.build },
      install: { commands: cmds.install },
      post_build: { commands: cmds.postBuild },
    }
    const projectConfig = {
      buildSpec: { phases, version: '0.2' },
      environment: { buildImage },
      role: cmds.role,
    }
    const project = new CB.PipelineProject(this, 'BuildProject', projectConfig)
    const stage = pipelineConf.pipeline.addStage(`${name}Stage`, { placement })
    const buildProps = { project, stage }
    return new CB.PipelineBuildAction(this, `${name}CodeBuild`, buildProps)
  }
}

interface PipelineConfig {
  atIndex: number
  pipeline: Pipeline
}

interface BuildConfig {
  build: string[]
  install: string[]
  postBuild: string[]
  role: IAM.Role
}

interface GitData {
  branch: string
  owner: string
  repo: string
  oauthToken: Secret
}

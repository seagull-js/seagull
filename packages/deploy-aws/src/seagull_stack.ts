import { App, Secret, SecretParameter, Stack, StackProps } from '@aws-cdk/cdk'

import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway'
import * as CM from '@aws-cdk/aws-certificatemanager'
import * as CF from '@aws-cdk/aws-cloudfront'
import * as CB from '@aws-cdk/aws-codebuild'
import { GitHubSourceAction, Pipeline } from '@aws-cdk/aws-codepipeline'
import * as Events from '@aws-cdk/aws-events'
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
  defaultRole?: IAM.Role // for extensions
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
      environment: { MODE: 'cloud', APP: this.id },
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
    this.defaultRole = new IAM.Role(this, name, roleParams)
    const policyStatement = new IAM.PolicyStatement()
    // TODO: add actions directly to the resources that need it
    this.defaultRole.addToPolicy(
      policyStatement.addAllResources().addActions(...actions)
    )
    return this.defaultRole
  }

  addCloudfront(cfdName: string, props: CloudfrontProps) {
    const name = `${this.id}-${cfdName}`
    const domainName = getApiGatewayDomain(props.apiGateway.url)
    const originPath = getApiGatewayPath(props.apiGateway.url)
    const allowedMethods = CF.CloudFrontAllowedMethods.ALL
    const forwardedValues = { headers: ['authorization'], queryString: true }
    const isDefaultBehavior = true
    const behaviors = [{ allowedMethods, forwardedValues, isDefaultBehavior }]
    const customOriginSource = { domainName }
    const conf = {
      aliasConfiguration: props.aliasConfig,
      comment: this.id,
      defaultRootObject: '',
      originConfigs: [{ behaviors, customOriginSource, originPath }],
    }
    return new CF.CloudFrontWebDistribution(this, name, conf)
  }

  addPipeline(pipelineName: string) {
    const name = `${this.id}-${pipelineName}`
    return new Pipeline(this, name, { pipelineName: name })
  }

  addSourceStage(name: string, config: SourceStageConfig) {
    const stageName = `${this.id}-stage-${name}`
    const sourceName = `${this.id}-github-${name}`
    const { atIndex, branch, owner, pipeline, repo, oauthToken } = config
    const stage = pipeline.addStage(stageName, { placement: { atIndex } })
    const stageConfig = { branch, oauthToken, owner, repo, stage }
    return new GitHubSourceAction(this, sourceName, stageConfig)
  }

  addBuildStage(name: string, config: BuildStageConfig) {
    const stageName = `${this.id}-stage-${name}`
    const buildName = `${this.id}-code-${name}`
    const projectName = `${this.id}-project-${name}`
    const { atIndex, build, env, install, pipeline, postBuild, role } = config
    const buildImage = CB.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
    const phases = { build, install, post_build: postBuild }
    const projectConfig = {
      buildSpec: { env, phases, version: '0.2' },
      environment: { buildImage },
      role,
    }
    const project = new CB.PipelineProject(this, projectName, projectConfig)
    const stage = pipeline.addStage(stageName, { placement: { atIndex } })
    const stageConfig = { project, stage }
    return new CB.PipelineBuildAction(this, buildName, stageConfig)
  }

  addSecretParam(name: string, ssmParameter: string) {
    const secretConfig = { ssmParameter }
    return new SecretParameter(this, name, secretConfig)
  }

  addNewCert(name: string, domains: string[]) {
    const domainName = domains[0]
    const altNames = domains.slice(1)
    const subjectAlternativeNames = altNames.length > 0 ? altNames : undefined
    const props: CM.CertificateProps = { domainName, subjectAlternativeNames }
    return new CM.Certificate(this, `${this.id}-${name}`, props)
  }

  importS3(bucketName: string, role?: IAM.IPrincipal) {
    const name = `${this.id}-${bucketName}`
    const bucketArn = `arn:aws:s3:::${bucketName}`
    const bucket = S3.Bucket.import(this, name, { bucketArn })
    // tslint:disable-next-line:no-unused-expression
    role && bucket.grantReadWrite(role)
    return bucket
  }

  addEventRule(rule: Rule, target: Events.IEventRuleTarget) {
    const name = rule.path.split('/').pop() || 'rootPath'
    const schedule = {
      scheduleExpression: rule.cron,
    }

    const eventRule = new Events.EventRule(this, name, schedule)
    eventRule.addTarget(target, { jsonTemplate: `{"path":"${rule.path}"}` })
    return eventRule
  }
}

export interface Rule {
  path: string
  cron: string
}

interface StageConfig {
  atIndex: number
  pipeline: Pipeline
}

interface BuildStageConfig extends StageConfig {
  build: { commands: string[]; finally: string[] }
  install: { commands: string[]; finally: string[] }
  postBuild: { commands: string[]; finally: string[] }
  role: IAM.Role
  env: { variables: { [key: string]: string } }
}

interface SourceStageConfig extends StageConfig {
  branch: string
  owner: string
  repo: string
  oauthToken: Secret
}

interface CloudfrontProps {
  apiGateway: RestApi
  aliasConfig?: CF.AliasConfiguration
}

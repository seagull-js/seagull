import { App, RemovalPolicy, SecretParameter, Stack, StackProps } from '@aws-cdk/cdk'

import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway'
import * as CM from '@aws-cdk/aws-certificatemanager'
import * as CF from '@aws-cdk/aws-cloudfront'
import { CloudFrontWebDistributionProps } from '@aws-cdk/aws-cloudfront'
import * as CB from '@aws-cdk/aws-codebuild'
import { GitHubSourceAction, Pipeline } from '@aws-cdk/aws-codepipeline'
import * as Events from '@aws-cdk/aws-events'
import * as IAM from '@aws-cdk/aws-iam'
import { Code, Function as Lambda, Runtime } from '@aws-cdk/aws-lambda'
import { LogGroup } from '@aws-cdk/aws-logs'
import * as S3 from '@aws-cdk/aws-s3'
import {
  getApiGatewayDomain,
  getApiGatewayPath,
  mapEnvironmentVariables,
} from './lib'
import {
  BuildStageConfig,
  CloudfrontProps,
  Keymap,
  Rule,
  SourceStageConfig,
} from './types'
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
    const props = { logGroupName, retentionDays, retainLogGroup: false }
    return new LogGroup(this, `${this.id}-${logGroupName}`, props)
  }

  addS3(bucketName: string, role?: IAM.IPrincipal, removalPolicy?: RemovalPolicy) {
    const s3Props = { bucketName, removalPolicy }
    const bucket = new S3.Bucket(this, `${this.id}-${bucketName}`, s3Props)
    // tslint:disable-next-line:no-unused-expression
    role && bucket.grantReadWrite(role)
    return bucket
  }

  addLambda(name: string, folder: string, role: IAM.Role, env: Keymap) {
    const lambdaName = `${this.id}-${name}`
    const conf = {
      code: Code.asset(`${folder}/.seagull/deploy`),
      description: 'universal route',
      environment: env,
      functionName: `${lambdaName}-handler`,
      handler: 'dist/assets/backend/lambda.handler',
      memorySize: 1536,
      role,
      runtime: Runtime.NodeJS810,
      timeout: 300,
    }
    return new Lambda(this, lambdaName, conf)
  }

  addUniversalApiGateway(apiGWName: string, lambda: Lambda, stageName: string) {
    const name = `${this.id}-${apiGWName}`
    const defaultIntegration = new LambdaIntegration(lambda)
    const conf = { binaryMediaTypes: ['*/*'], deployOptions: { stageName } }
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

  addCloudfront(cfdName: string, props: CloudfrontProps) {
    const name = `${this.id}-${cfdName}`
    const domainName = getApiGatewayDomain(props.apiGateway.url)
    const originPath = getApiGatewayPath(props.apiGateway.url)
    const defaultBehavior = {
      allowedMethods: CF.CloudFrontAllowedMethods.ALL,
      compress: true,
      forwardedValues: { headers: ['authorization'], queryString: true },
      isDefaultBehavior: true,
    }
    const behaviors = [defaultBehavior]
    const customOriginSource = { domainName }
    const conf: CloudFrontWebDistributionProps = {
      aliasConfiguration: props.aliasConfig,
      comment: this.id,
      defaultRootObject: '',
      loggingConfig: props.logBucket ? { bucket: props.logBucket } : {},
      originConfigs: [{ behaviors, customOriginSource, originPath }],
    }
    return new CF.CloudFrontWebDistribution(this, name, conf)
  }

  addPipeline(pipelineName: string) {
    const name = `${this.id}-${pipelineName}`
    return new Pipeline(this, name, { pipelineName: name })
  }

  addSourceStage(name: string, config: SourceStageConfig) {
    const stageName = name
    const sourceName = `${this.id}-github-${name}`
    const { atIndex, branch, owner, pipeline, repo, oauthToken } = config
    const stage = pipeline.addStage(stageName, { placement: { atIndex } })
    const stageConfig = {
      branch,
      oauthToken,
      outputArtifactName: name,
      owner,
      repo,
      stage,
    }
    return new GitHubSourceAction(this, sourceName, stageConfig)
  }

  addBuildActionStage(name: string, config: BuildStageConfig) {
    const stageName = name
    const projectName = `${this.id}-project-${name}`
    const { atIndex, pipeline } = config
    const projectConfig = this.createProjectConfig(config)
    const additionalOutputArtifactNames = this.getAdditionalOutputArtifactNames(
      name,
      config
    )
    const project = new CB.PipelineProject(this, projectName, projectConfig)
    const stage = pipeline.addStage(stageName, { placement: { atIndex } })
    const stageConfig = {
      additionalInputArtifacts: config.additionalInputArtifacts,
      additionalOutputArtifactNames,
      inputArtifact: config.inputArtifact,
      outputArtifactName: name,
      project,
      stage,
    }
    return new CB.PipelineBuildAction(this, name, stageConfig)
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

  getLogBucketConfig(name: string | undefined) {
    const bucket = name ? this.addS3(name) : false
    return bucket ? { bucket } : {}
  }

  private createProjectConfig(config: BuildStageConfig) {
    const { build, env, install, postBuild, role } = config
    const buildImage = CB.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
    const phases = { build, install, post_build: postBuild }
    return {
      buildSpec: {
        artifacts: config.outputArtifacts,
        env,
        phases,
        version: '0.2',
      },
      environment: { buildImage },
      environmentVariables: mapEnvironmentVariables(env.variables),
      role,
    }
  }

  private getAdditionalOutputArtifactNames(
    name: string,
    config: BuildStageConfig
  ): string[] {
    if (config.outputArtifacts) {
      return Object.keys(config.outputArtifacts['secondary-artifacts'])
        .filter(key => key !== name)
        .map(key => config.outputArtifacts['secondary-artifacts'][key].name)
    }
    return []
  }
}

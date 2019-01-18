import {
  CfnApiKey,
  CfnUsagePlan,
  CfnUsagePlanKey,
  LambdaIntegration,
  RestApi,
} from '@aws-cdk/aws-apigateway'
import * as CF from '@aws-cdk/aws-cloudfront'
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import * as S3 from '@aws-cdk/aws-s3'
import { App, Stack, StackProps, Token } from '@aws-cdk/cdk'

import { getApiGatewayDomain, getApiGatewayPath } from '..'

interface ProjectStackProps extends StackProps {
  s3Name: string
  env: { account?: string; path: string; region: string }
}

export class AppStack extends Stack {
  private appName: string
  private folder: string
  private s3Name: string

  private defaultIntegration?: LambdaIntegration
  private apiGateway?: RestApi
  private role?: Role

  private apiGatewayOriginPath!: string
  private apiGatewayDomain!: string

  constructor(parent: App, name: string, props: ProjectStackProps) {
    super(parent, name, props)
    this.appName = name
    this.s3Name = props.s3Name
    this.folder = props.env.path
    this.addIAMRole()
    this.addLambda()
    this.addS3()
    this.addApiGateway()
    this.addCloudfront()
  }

  private addS3() {
    const s3Props = { bucketName: this.s3Name }
    const bucket = new S3.Bucket(this, `${this.appName}-item-bucket`, s3Props)
    bucket.grantReadWrite(this.role)
  }

  private addLambda() {
    const name = `${this.appName}-lambda`
    const conf = {
      code: Code.asset(`${this.folder}/.seagull/deploy`),
      description: 'universal route',
      functionName: `${name}-handler`,
      handler: 'dist/assets/backend/lambda.handler',
      memorySize: 3008,
      role: this.role,
      runtime: Runtime.NodeJS810,
      timeout: 300,
    }

    const lambdaFunction = new LambdaFunction(this, name, conf)
    this.defaultIntegration = new LambdaIntegration(lambdaFunction)
  }

  private addApiGateway() {
    const name = `${this.appName}-api-gateway`
    const conf = { binaryMediaTypes: ['*/*'] }
    this.apiGateway = new RestApi(this, name, conf)

    const apiKeyConfig = {
      description: 'api key for general api route',
      enabled: true,
      generateDistinctId: true,
      name: `${name}-api-key`,
      stageKeys: [
        { restApiId: new Token(this.apiGateway.restApiId), stageName: 'prod' },
      ],
    }
    const usagePlanConfig = {
      apiStages: [
        { apiId: new Token(this.apiGateway.restApiId), stage: 'prod' },
      ],
      description: 'universal plan to secure the api gateway',
      usagePlanName: 'universal plan',
    }
    const apiKey = new CfnApiKey(this, 'lambdaApiKey', apiKeyConfig)
    const usagePlan = new CfnUsagePlan(this, 'usagePlan', usagePlanConfig)
    const usageKeyConfig = {
      keyId: new Token(apiKey.apiKeyId),
      keyType: 'API_KEY',
      usagePlanId: new Token(usagePlan.usagePlanId),
    }
    // tslint:disable-next-line:no-unused-expression
    new CfnUsagePlanKey(this, 'usageKey', usageKeyConfig)

    const proxy = this.apiGateway.root.addResource('{any+}')
    this.apiGateway.root.addMethod('GET', this.defaultIntegration, {
      apiKeyRequired: true,
    })
    this.apiGateway.root.addMethod('POST', this.defaultIntegration, {
      apiKeyRequired: true,
    })
    this.apiGateway.root.addMethod('DELETE', this.defaultIntegration, {
      apiKeyRequired: true,
    })
    proxy.addMethod('GET', this.defaultIntegration, { apiKeyRequired: true })
    proxy.addMethod('POST', this.defaultIntegration, { apiKeyRequired: true })
    proxy.addMethod('DELETE', this.defaultIntegration, { apiKeyRequired: true })
    this.apiGatewayDomain = getApiGatewayDomain(this.apiGateway.url)
    this.apiGatewayOriginPath = getApiGatewayPath(this.apiGateway.url)
  }

  private addIAMRole() {
    const name = `${this.name}-Role`
    const principleName = 'lambda.amazonaws.com'
    const roleParams = { assumedBy: new ServicePrincipal(principleName) }
    const actions: string[] = []
    actions.push('sts:AssumeRole')
    actions.push('logs:CreateLogStream')
    actions.push('logs:PutLogEvents')
    actions.push('lambda:InvokeFunction')
    actions.push('lambda:InvokeAsync')
    actions.push('s3:*')

    const role = new Role(this, name, roleParams)
    const policyStatement = new PolicyStatement()
    // TODO: add actions directly to the resources that need it
    role.addToPolicy(policyStatement.addAllResources().addActions(...actions))
    this.role = role
  }

  private addCloudfront() {
    const name = `${this.name}CFD`
    const originPath = this.apiGatewayOriginPath
    const allowedMethods = CF.CloudFrontAllowedMethods.ALL
    const behaviors = [{ allowedMethods, isDefaultBehavior: true }]
    const customOriginSource = { domainName: this.apiGatewayDomain }
    const originConfigs = [{ behaviors, customOriginSource, originPath }]
    const conf = { defaultRootObject: '', originConfigs }
    // tslint:disable-next-line:no-unused-expression
    new CF.CloudFrontWebDistribution(this, name, conf)
  }
}

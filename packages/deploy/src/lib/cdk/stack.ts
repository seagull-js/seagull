import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway'
import * as CF from '@aws-cdk/aws-cloudfront'
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { LogGroup } from '@aws-cdk/aws-logs'
import * as S3 from '@aws-cdk/aws-s3'
import { App, Stack, StackProps } from '@aws-cdk/cdk'

import { getApiGatewayDomain, getApiGatewayPath } from '..'

interface ProjectStackProps extends StackProps {
  deployS3: boolean
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
    this.addLogGroup()
    // tslint:disable-next-line:no-unused-expression
    props.deployS3 && this.addS3()
    this.addApiGateway()
    this.addCloudfront()
  }

  private addLogGroup() {
    const name = `${this.appName}-log-group`
    const logGroupName = `/aws/lambda/${this.appName}-lambda-handler`
    const retentionDays = Infinity
    const props = { logGroupName, retentionDays }
    // tslint:disable-next-line:no-unused-expression
    new LogGroup(this, name, props)
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
      environment: { MODE: 'cloud' },
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

    const proxy = this.apiGateway.root.addResource('{any+}')
    this.apiGateway.root.addMethod('GET', this.defaultIntegration)
    this.apiGateway.root.addMethod('POST', this.defaultIntegration)
    this.apiGateway.root.addMethod('DELETE', this.defaultIntegration)
    proxy.addMethod('GET', this.defaultIntegration)
    proxy.addMethod('POST', this.defaultIntegration)
    proxy.addMethod('DELETE', this.defaultIntegration)
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
    const comment = this.appName
    const conf = { comment, defaultRootObject: '', originConfigs }
    // tslint:disable-next-line:no-unused-expression
    new CF.CloudFrontWebDistribution(this, name, conf)
  }
}

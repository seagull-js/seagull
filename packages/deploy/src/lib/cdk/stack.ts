import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway'
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront'
import { PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { App, Stack, StackProps } from '@aws-cdk/cdk'
import { getApiGatewayDomain, getApiGatewayPath } from '..'

interface ProjectStackProps extends StackProps {
  env: { account?: string; path: string; region: string }
}

export class AppStack extends Stack {
  private appName: string
  private folder: string

  private defaultIntegration!: LambdaIntegration
  private apiGateway!: RestApi

  private apiGatewayOriginPath!: string
  private apiGatewayDomain!: string

  constructor(parent: App, name: string, props: ProjectStackProps) {
    super(parent, name, props)
    this.appName = name
    this.folder = props.env.path
    this.addLambda()
    this.addApiGateway()
    this.addIAMRole()
    this.addCloudfront()
  }

  private addLambda() {
    const name = `${this.appName}-lambda`
    const code = Code.asset(`${this.folder}/.seagull/deploy`)
    const description = 'universal route'
    const functionName = `${name}-handler`
    const handler = 'dist/assets/backend/lambda.handler'
    const runtime = Runtime.NodeJS810
    const timeout = 300
    const conf = { code, description, functionName, handler, runtime, timeout }

    const lambdaFunction = new LambdaFunction(this, name, conf)
    this.defaultIntegration = new LambdaIntegration(lambdaFunction)
  }

  private addApiGateway() {
    const name = `${this.appName}-api-gateway`
    const conf = { binaryMediaTypes: ['*/*'] }
    this.apiGateway = new RestApi(this, name, conf)

    const proxy = this.apiGateway.root.addResource('{any+}')
    this.apiGateway.root.addMethod('GET', this.defaultIntegration)
    proxy.addMethod('GET', this.defaultIntegration)
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

    const role = new Role(this, name, roleParams)
    const policyStatement = new PolicyStatement()
    // TODO: add actions directly to the resources that need it
    role.addToPolicy(policyStatement.addAllResources().addActions(...actions))
  }

  private addCloudfront() {
    const name = `${this.name}CFD`
    const originPath = this.apiGatewayOriginPath
    const behaviors = [{ isDefaultBehavior: true }]
    const customOriginSource = { domainName: this.apiGatewayDomain }
    const originConfigs = [{ behaviors, customOriginSource, originPath }]
    const conf = { defaultRootObject: '', originConfigs }
    // tslint:disable-next-line:no-unused-expression
    new CloudFrontWebDistribution(this, name, conf)
  }
}

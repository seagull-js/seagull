import * as api from '@aws-cdk/aws-apigateway'
import * as cloudFront from '@aws-cdk/aws-cloudfront'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cdk from '@aws-cdk/cdk'

interface ProjectProps {
  account?: string
  region: string
  path: string
}

export class ProjectApp extends cdk.App {
  constructor(name: string, projectProps: ProjectProps) {
    super()
    const { account, region, path } = projectProps
    // tslint:disable-next-line:no-unused-expression
    new AppStack(this, name, { env: { account, path, region } })
  }
}

interface StackProps extends cdk.StackProps {
  env: { account?: string; path: string; region: string }
}

class AppStack extends cdk.Stack {
  private appName: string
  private folder: string

  private defaultIntegration!: api.LambdaIntegration
  private apiGateway!: api.RestApi

  private apiGatewayOriginPath!: string
  private apiGatewayDomain!: string

  constructor(parent: cdk.App, name: string, props: StackProps) {
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
    const code = lambda.Code.asset(`${this.folder}/.seagull/deploy`)
    const description = 'universal route'
    const functionName = `${name}-handler`
    const handler = 'dist/assets/backend/lambda.handler'
    const runtime = lambda.Runtime.NodeJS810
    const timeout = 300
    const conf = { code, description, functionName, handler, runtime, timeout }

    const lambdaFunction = new lambda.Function(this, name, conf)
    this.defaultIntegration = new api.LambdaIntegration(lambdaFunction)
  }

  private addApiGateway() {
    const name = `${this.appName}-api-gateway`
    const conf = { binaryMediaTypes: ['*/*'] }
    this.apiGateway = new api.RestApi(this, name, conf)

    const proxy = this.apiGateway.root.addResource('{any+}')
    this.apiGateway.root.addMethod('GET', this.defaultIntegration)
    proxy.addMethod('GET', this.defaultIntegration)
    this.apiGatewayDomain = getApiGatewayDomain(this.apiGateway.url)
    this.apiGatewayOriginPath = getApiGatewayPath(this.apiGateway.url)
  }

  private addIAMRole() {
    const name = `${this.name}-Role`
    const principleName = 'lambda.amazonaws.com'
    const roleParams = { assumedBy: new iam.ServicePrincipal(principleName) }
    const actions: string[] = []
    actions.push('sts:AssumeRole')
    actions.push('logs:CreateLogStream')
    actions.push('logs:PutLogEvents')
    actions.push('lambda:InvokeFunction')
    actions.push('lambda:InvokeAsync')

    const role = new iam.Role(this, name, roleParams)
    const policyStatement = new iam.PolicyStatement()
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
    new cloudFront.CloudFrontWebDistribution(this, name, conf)
  }
}

function getApiGatewayDomain(url: string): string {
  const noProtocolUrl = url.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(0, noProtocolUrl.indexOf('/'))
}

function getApiGatewayPath(url: string): string {
  const noSlashAtEnd = url.endsWith('/') ? url.slice(0, -1) : url
  const noProtocolUrl = noSlashAtEnd.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(noProtocolUrl.indexOf('/'))
}

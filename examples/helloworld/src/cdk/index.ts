import * as cdk from '@aws-cdk/cdk'
import * as api from '@aws-cdk/aws-apigateway'
import * as cf from '@aws-cdk/aws-cloudfront'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
const pkg = require('../../package.json')

class AppStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)
    const lambdaName = `${pkg.name}-handler`
    const lambdaParams: lambda.FunctionProps = {
      code: lambda.Code.asset('.'),
      description: 'universal route',
      functionName: lambdaName,
      handler: 'dist/assets/backend/lambda.handler',
      runtime: lambda.Runtime.NodeJS810,
    }
    const fn = new lambda.Function(this, lambdaName, lambdaParams)

    const apiGateway = new api.RestApi(this, `${pkg.name}-api-gateway`, {
      binaryMediaTypes: ['*/*'],
    })

    const defaultIntegration = new api.LambdaIntegration(fn)
    apiGateway.root.addMethod('GET', defaultIntegration)
    const proxy = apiGateway.root.addResource('{any+}')
    proxy.addMethod('GET', defaultIntegration)
    const role = new iam.Role(this, `${pkg.name}-Role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    })
    // TODO: PLEASE! PLEASE! WORK THIS OVER!!! this could be a viable security breach.
    role.addToPolicy(
      new iam.PolicyStatement()
        .addAllResources()
        .addActions(
          'sts:AssumeRole',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
          'lambda:InvokeFunction',
          'lambda:InvokeAsync'
        )
    )
    const cfConfig = {
      defaultRootObject: '',
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          customOriginSource: {
            domainName: getApiGatewayDomain(apiGateway.url.toString()),
          },
          originPath: getApiGatewayPath(apiGateway.url.toString()),
        },
      ],
    }
    new cf.CloudFrontWebDistribution(this, `${pkg.name}CFD`, cfConfig)
  }
}

class MyApp extends cdk.App {
  constructor() {
    super()
    new AppStack(this, pkg.name)
  }
}

new MyApp().run()

function getApiGatewayDomain(url: string): string {
  const noProtocolUrl = url.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(0, noProtocolUrl.indexOf('/'))
}

function getApiGatewayPath(url: string): string {
  const noSlashAtEnd = url.endsWith('/') ? url.slice(0, -1) : url
  const noProtocolUrl = noSlashAtEnd.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(noProtocolUrl.indexOf('/'))
}

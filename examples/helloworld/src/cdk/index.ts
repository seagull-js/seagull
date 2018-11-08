import * as cdk from '@aws-cdk/cdk'
import * as api from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'

const pkg = require('../../package.json')

const code = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverless = require("serverless-http");
const app_1 = require("./app");
module.exports.handler = serverless(app_1.default, {
    binary: ['image/*'],
    request: (request, event, context) => {
        console.log(request);
    },
    response: (response, event, context) => {
        console.log(response);
    },
});
`

class AppStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props)
    const lambdaName = `${pkg.name}-handler`
    const lambdaParams: lambda.FunctionProps = {
      code: lambda.Code.asset('./dist/assets'),
      description: 'universal route',
      functionName: lambdaName,
      handler: 'backend/lambda.handler',
      runtime: lambda.Runtime.NodeJS810,
    }
    const fn = new lambda.Function(this, lambdaName, lambdaParams)
    const apiGateway = new api.RestApi(this, `${pkg.name}-api-gateway`)
    const defaultIntegration = new api.LambdaIntegration(fn)
    // apiGateway.root.addMethod('ANY', lambdaIntegration)
    // const wildCard = apiGateway.root.addResource('{any+}')
    // wildCard.addMethod('GET', lambdaIntegration)
    apiGateway.root.addProxy({ defaultIntegration })
  }
}

class MyApp extends cdk.App {
  constructor() {
    super()

    new AppStack(this, pkg.name)
  }
}

new MyApp().run()

import { App, Secret } from '@aws-cdk/cdk'

import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { PolicyStatement } from '@aws-cdk/aws-iam'
import { find } from 'lodash'
import { SeagullStack } from '../src'
import { isInList } from './test-helper/template_searching'

@suite('SeagullStack')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create a stack with props'() {
    const stackName = 'test-stack'
    const app = new App()
    const stackProps = { env: { account: '123456', region: 'my-region-1' } }
    // tslint:disable-next-line:no-unused-expression
    new SeagullStack(app, stackName, stackProps)
    const synth = app.synthesizeStack(stackName)
    synth.name.should.be.equal(stackName)
    synth.environment.account.should.be.equals('123456')
    synth.environment.region.should.be.equals('my-region-1')
  }

  @test
  async 'can add a log group to a stack'() {
    const stackName = 'test-stack'
    const logGroupName: string = 'my-log-group'
    const app = new App()
    // tslint:disable-next-line:no-unused-expression
    const stack = new SeagullStack(app, stackName)
    stack.addLogGroup(logGroupName)
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const logGroupNameNoDash = logGroupName.replace(/-/g, '')
    const logInTemp = isInList(resources, logGroupNameNoDash, stackNameNoDash)
    const logInMeta = isInList(metadata, logGroupName, stackName)
    logInTemp.should.be.equals(true)
    logInMeta.should.be.equals(true)
  }

  @test
  async 'can add a role to stack'() {
    const stackName = 'test-stack'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    stack.addIAMRole(roleName, 'lambda.amazonaws.com', ['action1', 'action2'])
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const roleNoDash = roleName.replace(/-/g, '')
    const defPolicy = 'DefaultPolicy'
    const roleInTemp = isInList(resources, roleNoDash, stackNoDash, defPolicy)
    const roleInMeta = isInList(metadata, roleName, stackName, defPolicy)
    roleInTemp.should.be.equals(true)
    roleInMeta.should.be.equals(true)
  }

  @test
  async 'can add a s3 bucket to a stack'() {
    const stackName = 'test-stack'
    const s3Name = 'my-s3'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    stack.addS3(s3Name)
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equals(true)
    s3InMeta.should.be.equals(true)
  }

  @test
  async 'can add a s3 bucket and a role to a stack'() {
    const stackName = 'test-stack'
    const s3Name = 'my-s3'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    const role = stack.addIAMRole(roleName, 'lambda.amazonaws.com', [])
    stack.addS3(s3Name, role)
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const roleNoDash = roleName.replace(/-/g, '')
    const defPolicy = 'DefaultPolicy'
    const s3InTemp = isInList(resources, s3NameNoDash, stackNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    const roleInTemp = isInList(resources, roleNoDash, stackNoDash, defPolicy)
    const roleInMeta = isInList(metadata, roleName, stackName, defPolicy)
    s3InTemp.should.be.equals(true)
    s3InMeta.should.be.equals(true)
    roleInTemp.should.be.equals(true)
    roleInMeta.should.be.equals(true)
  }

  @test
  async 'can add a lambda'() {
    const stackName = 'test-stack'
    const lambdaName = 'my-lambda'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    const role = stack.addIAMRole(roleName, 'lambda.amazonaws.com', [])
    stack.addLambda(lambdaName, './test_data', role, {})
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const lambdaNameNoDash = lambdaName.replace(/-/g, '')
    const roleNoDash = roleName.replace(/-/g, '')
    const defPolicy = 'DefaultPolicy'
    const lambdaInTemp = isInList(resources, lambdaNameNoDash, stackNoDash)
    const lambdaInMeta = isInList(metadata, lambdaName, stackName)
    const roleInTemp = isInList(resources, roleNoDash, stackNoDash, defPolicy)
    const roleInMeta = isInList(metadata, roleName, stackName, defPolicy)
    lambdaInTemp.should.be.equals(true)
    lambdaInMeta.should.be.equals(true)
    roleInTemp.should.be.equals(true)
    roleInMeta.should.be.equals(true)
  }

  @test
  async 'can add a api gateway'() {
    const stackName = 'test-stack'
    const lambdaName = 'my-lambda'
    const apiGatewayName = 'my-api-gateway'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    const role = stack.addIAMRole(roleName, 'lambda.amazonaws.com', [])
    const lambda = stack.addLambda(lambdaName, './test_data', role, {})
    stack.addUniversalApiGateway(apiGatewayName, lambda, 'prod')
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const gatewayNameNoDash = apiGatewayName.replace(/-/g, '')
    const gatewayInTemp = isInList(resources, gatewayNameNoDash, stackNoDash)
    const gatewayInMeta = isInList(metadata, apiGatewayName, stackName)
    gatewayInTemp.should.be.equals(true)
    gatewayInMeta.should.be.equals(true)
  }

  @test
  async 'can add a cloudfront'() {
    const stackName = 'test-stack'
    const lambdaName = 'my-lambda'
    const apiGatewayName = 'my-api-gateway'
    const cloudfrontName = 'my-cloudfront'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    const role = stack.addIAMRole(roleName, 'lambda.amazonaws.com', [])
    const lambda = stack.addLambda(lambdaName, './test_data', role, {})
    const apiGW = stack.addUniversalApiGateway(apiGatewayName, lambda, 'prod')
    stack.addCloudfront(cloudfrontName, { apiGateway: apiGW })
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const cloudfrontNameNoDash = cloudfrontName.replace(/-/g, '')
    const cloudfrInTemp = isInList(resources, cloudfrontNameNoDash, stackNoDash)
    const cloudfrMeta = isInList(metadata, cloudfrontName, stackName)
    cloudfrInTemp.should.be.equals(true)
    cloudfrMeta.should.be.equals(true)
  }

  @test
  async 'can add a pipeline'() {
    const stackName = 'test-stack'
    const pipelineName = 'test-pipeline'
    const sourceName = 'test-source'
    const buildName = 'test-build'
    const roleName = 'test-role'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    const role = stack.addIAMRole(roleName, 'codebuild.amazonaws.com', [])
    const pipeline = stack.addPipeline(pipelineName)
    const sourceConfig = {
      atIndex: 0,
      branch: 'master',
      oauthToken: new Secret('12345678'),
      owner: 'me',
      pipeline,
      poll: false,
      repo: 'test-project',
    }
    stack.addSourceStage(sourceName, sourceConfig)
    const buildConfig = {
      atIndex: 1,
      build: { commands: ['echo "start build"'], finally: [] },
      computeTypeSize: 'SMALL' as const,
      env: { variables: {} },
      install: { commands: ['npm i'], finally: [] },
      pipeline,
      postBuild: { commands: ['npm run test'], finally: [] },
      role,
    }

    stack.addBuildActionStage(buildName, buildConfig, buildConfig, 4)
    const synth = app.synthesizeStack(stackName)
    const resources = Object.keys(synth.template.Resources)
    const metadata = Object.keys(synth.metadata)
    const stackNoDash = stackName.replace(/-/g, '')
    const pipelineNameNoDash = pipelineName.replace(/-/g, '')
    const sourceNameNoDash = sourceName.replace(/-/g, '')
    const buildNameNoDash = buildName.replace(/-/g, '')
    const sourceInTemp = isInList(resources, sourceNameNoDash, stackNoDash)
    const sourceMeta = isInList(metadata, sourceName, stackName)
    const buildInTemp = isInList(resources, buildNameNoDash, stackNoDash)
    const buildMeta = isInList(metadata, buildName, stackName)
    const pipelineInTemp = isInList(resources, pipelineNameNoDash, stackNoDash)
    const pipelineMeta = isInList(metadata, pipelineName, stackName)
    sourceInTemp.should.be.equals(true)
    sourceMeta.should.be.equals(true)
    buildInTemp.should.be.equals(true)
    buildMeta.should.be.equals(true)
    pipelineInTemp.should.be.equals(true)
    pipelineMeta.should.be.equals(true)
  }

  @test
  async 'can add a secret paramter'() {
    const stackName = 'test-stack'
    const secretName = 'test-secret'
    const app = new App()
    const stack = new SeagullStack(app, stackName)
    stack.addSecretParam(secretName, 'my-secret-key')
    const secretNameNoDash = secretName.replace(/-/g, '')
    const synth = app.synthesizeStack(stackName)
    const parameters = Object.keys(synth.template.Parameters)
    const metadata = Object.keys(synth.metadata)
    const secretInParameters = isInList(parameters, secretNameNoDash)
    const secretMeta = isInList(metadata, secretName, stackName)
    secretInParameters.should.be.equals(true)
    secretMeta.should.be.equals(true)
  }
}

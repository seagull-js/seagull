import { expect as awsExpect, matchTemplate } from '@aws-cdk/assert'
import { BasicTest } from '@seagull/testing';
import { expect } from 'chai'
import { suite, test } from 'mocha-typescript'
import { SeagullPipeline } from '../../src'
import { SSMHandler } from '../../src/aws_sdk_handler/handle_ssm'

@suite('SeagullPipeline')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create a pipeline'() {
    const props = {
      appPath: `${process.cwd()}/test_data`,
      branch: 'master',
      githubToken: 'Token123',
      handlers: { ssmHandler: new TestSSMHandler({ Token123: '123' }) },
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
      stage: 'prod',
    }
    const pipeline = await new SeagullPipeline(props).createPipeline()
    const synthStack = pipeline.run().getStack('helloworld-ci')
    expect(Object.keys(synthStack.template.Resources).length).to.equal(12)
    const pipelineKeys = Object.keys(synthStack.template.Resources).filter(
      key =>
        synthStack.template.Resources[key].Type ===
        'AWS::CodePipeline::Pipeline'
    )
    expect(pipelineKeys.length).to.equal(1)
    const codePipeline = synthStack.template.Resources[pipelineKeys[0]]
    expect(codePipeline.Properties.Stages.length).to.equal(5)
  }

  @test
  async 'creates all pipeline resources'() {
    const props = {
      appPath: `${process.cwd()}/test_data`,
      branch: 'master',
      githubToken: 'Token123',
      handlers: { ssmHandler: new TestSSMHandler({ Token123: '123' }) },
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
      stage: 'prod',
    }
    const pipeline = await new SeagullPipeline(props).createPipeline()
    const synthStack = pipeline.run().getStack('helloworld-ci')
    awsExpect(synthStack).to(
      matchTemplate(require('./fixtures/helloworld-ci-pipeline'))
    )
  }
}

class TestSSMHandler extends SSMHandler {
  private mockStore: { [key: string]: string }

  constructor(testData?: { [key: string]: string }) {
    super()
    this.mockStore = testData || {}
  }

  async getParameter(ssmName: string) {
    return this.mockStore[ssmName] || ''
  }

  async createParameter(name: string, value: string) {
    this.mockStore[name] = value
    return
  }
}

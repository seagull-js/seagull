import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { SeagullPipeline } from '../../src'

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
      mode: 'prod',
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
    }
    const pipeline = await new SeagullPipeline(props).createPipeline()
    const synthStack = pipeline.synthesizeStack('helloworld-ci')
    Object.keys(synthStack.template.Resources).length.should.be.equals(8)
  }
}

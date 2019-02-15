import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { SeagullApp } from '../src'

@suite('SeagullApp')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create an app with props'() {
    const projectName = 'test'
    const props = { projectName }
    const app = new SeagullApp(props)
    const synth = app.synthesizeStack(projectName)
    // tslint:disable-next-line:no-console
    synth.name.should.be.equals(projectName)
  }
}

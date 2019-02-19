import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { createLogicalToPathMap, SeagullApp, SeagullStack } from '../../src'

@suite('LogicalToPathMap')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create empty LogicalToPathMap for empty stack'() {
    const projectName = 'test-project'
    const app = new SeagullApp({ projectName })
    const synthStack = app.synthesizeStack(projectName)
    const map = createLogicalToPathMap(synthStack)
    const mapExistsAndIsEmpty = map && Object.keys(map).length === 0
    mapExistsAndIsEmpty.should.be.equals(true)
  }

  @test
  async 'can create a LogicalToPathMap for a not empty stack'() {
    const projectName = 'test-project'
    const logGroupName = 'test-log'
    const app = new SeagullApp({ projectName })
    app.stack.addLogGroup(logGroupName)
    const synthStack = app.synthesizeStack(projectName)
    const map = createLogicalToPathMap(synthStack)
    const mapEntry = map[Object.keys(map)[0]]
    mapEntry.indexOf(projectName).should.be.above(-1)
    mapEntry.indexOf(logGroupName).should.be.above(-1)
  }
}

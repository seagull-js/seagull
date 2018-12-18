import { Mode } from '@seagull/mode'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { BasicTest } from '../src/basic_test'

class DemoMock {
  activated: boolean = false

  activate() {
    this.activated = true
  }

  deactivate() {
    this.activated = false
  }

  reset(): void {
    return undefined
  }
}

@suite('BasicTest')
export class Test extends BasicTest {
  @test
  async 'tests should run in pure mode'() {
    const basicTest = new BasicTest()
    basicTest.before()
    Mode.environment.should.be.eq('pure')
  }

  @test
  async 'can be used with mocha-typescript'() {
    this.mocks.should.be.an('array')
  }

  @test
  async 'does activate mocks on before() and disable on after()'() {
    const basicTest = new BasicTest()
    const mock = new DemoMock()
    basicTest.mocks = [mock]
    mock.activated.should.be.equal(false)
    basicTest.before()
    mock.activated.should.be.equal(true)
    basicTest.after()
    mock.activated.should.be.equal(false)
  }
}

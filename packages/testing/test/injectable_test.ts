import { Http, HttpJson } from '@seagull/http'
import { Mode } from '@seagull/mode'
import { expect } from 'chai'
import 'chai/register-should'
import { injectable } from 'inversify'
import { suite, test } from 'mocha-typescript'
import { InjectableTest } from '../src/injectable_test'

@injectable()
class DemoInjectable {
  demoFunction = () => true
}

@suite('BasicTest')
export class Test extends InjectableTest {
  inject = [DemoInjectable]

  beforeEachHasBeenCalled = false
  afterEachHasBeenCalled = false

  beforeEach() {
    this.beforeEachHasBeenCalled = true
  }

  afterEach() {
    this.afterEachHasBeenCalled = true
  }

  @test
  async 'beforeEach has been called'() {
    expect(this.beforeEachHasBeenCalled).to.equal(true)
  }

  @test
  async 'afterEach has been called'() {
    expect(this.afterEachHasBeenCalled).to.equal(true)
  }

  @test
  async 'tests should run in pure mode'() {
    const injectableTest = new Test()
    injectableTest.before()
    Mode.environment.should.be.eq('pure')
  }

  @test
  async 'diModules are registered'() {
    // @seagull/http
    const http = this.injector.get(Http)
    expect(http).to.be.an('object')
    const httpJson = this.injector.get(HttpJson)
    expect(http).to.be.an('object')
  }

  @test
  async 'injectables are registered'() {
    const demoInstance = this.injector.get(DemoInjectable)
    expect(demoInstance).to.be.an('object')
    expect(demoInstance.demoFunction).to.be.a('function')
    expect(demoInstance.demoFunction()).to.equal(true)
  }
}

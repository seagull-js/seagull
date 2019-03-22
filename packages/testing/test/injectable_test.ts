import { Mode } from '@seagull/mode'
import { expect } from 'chai'
import 'chai/register-should'
import { ContainerModule, injectable, interfaces } from 'inversify'
import { suite, test } from 'mocha-typescript'
import 'reflect-metadata'
import { InjectableTest } from '../src/injectable_test'

@injectable()
class DemoInjectable {
  demoFunction = () => true
}

@injectable()
class DemoContainerInjectable {
  demoFunction = () => true
}

const diModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(DemoContainerInjectable).toSelf()
})

@suite('BasicTest')
export class Test extends InjectableTest {
  inject = [DemoInjectable]
  injectDiModules = [diModule]

  @test
  async 'tests should run in pure mode'() {
    const injectableTest = new Test()
    injectableTest.before()
    Mode.environment.should.be.eq('pure')
  }

  @test
  async 'diModules are registered'() {
    // @seagull/http
    const http = this.injector.get(DemoContainerInjectable)
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

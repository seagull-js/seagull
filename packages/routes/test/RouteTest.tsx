import { Http } from '@seagull/http'
import { Mode } from '@seagull/mode'
import { expect } from 'chai'
import 'chai/register-should'
import { ContainerModule, injectable } from 'inversify'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static path = '/'
  static dependencies = new ContainerModule(bind => {
    bind(DemoInjectable).toSelf()
  })
  static async handler(this: RouteContext) {
    const demo = this.injector.get(DemoInjectable)
    expect(demo).to.be.an('object')
    const http = this.injector.get(Http)
    expect(http).to.be.an('object')
    return this.text('demo route')
  }
}

@injectable()
class DemoInjectable {}

@suite('RouteTest')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'mode environment is pure'() {
    expect(Mode.environment).to.be.eq('pure')
  }
  @test
  async 'can be invoked'() {
    const { code, data } = await this.invoke('/', {})
    code.should.be.equal(200)
    data.should.be.equal('demo route')
  }
  @test
  async 'mocked context results can be asserted'() {
    const ctx = await this.invokeMocked('/', {})
    expect(ctx.called).to.be.equal('text')
    expect(ctx.text.data).to.be.equal('demo route')
  }
}

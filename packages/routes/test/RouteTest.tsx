import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { HttpMethod, Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static method: HttpMethod = 'GET'
  static path = '/'
  static async handler(this: RouteContext) {
    return this.text('demo route')
  }
}

@suite('RouteTest')
export class Test extends RouteTest {
  route = DemoRoute

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

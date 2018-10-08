import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteTest } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  async handler() {
    return this.text('demo route')
  }
}

@suite('RouteTest')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can be invoked'() {
    const { code, data } = await this.invoke('GET', '/', {})
    code.should.be.equal(200)
    data.should.be.equal('demo route')
  }
}

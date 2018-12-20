import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteTest } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  static cache = 300
  async handler() {
    return this.text('demo route')
  }
}

@suite('RouteCache')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'setting cache in routes works'() {
    const { code, data, headers } = await this.invoke('GET', '/', {})
    code.should.be.equal(200)
    headers['cache-control'].should.be.equal('max-age=300')
  }
}

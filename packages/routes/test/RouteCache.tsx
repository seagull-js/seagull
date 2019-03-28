import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static path = '/'
  static cache = 300

  static async handler(this: RouteContext) {
    this.text('hey' + this.request.url)
  }
}

@suite('RouteCache')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'setting cache in routes works'() {
    const { code, data, headers } = await this.invoke('/', {})
    code.should.be.equal(200)
    headers['cache-control'].should.be.equal('max-age=300')
  }
}

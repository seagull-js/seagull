import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteTest, RouteContext } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  static async handler(this: RouteContext) {
    return this.text('hello world')
  }
}

@suite('Route::Text')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can return html response'() {
    const { code, data, headers } = await this.invoke('GET', '/', {})
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/plain')
    data.should.be.equal('hello world')
  }
}

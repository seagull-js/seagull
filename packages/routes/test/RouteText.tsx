import { RouteTest } from '@seagull/test-routes'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { Route, RouteContext } from '../src'

class DemoRoute extends Route {
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
    const { code, data, headers } = await this.invoke('/', {})
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/plain')
    data.should.be.equal('hello world')
  }
}

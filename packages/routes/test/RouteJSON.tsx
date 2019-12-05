import { RouteTest } from '@seagull/test-routes'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { Route, RouteContext } from '../src'

class DemoRoute extends Route {
  static path = '/'
  static async handler(this: RouteContext) {
    return this.json({ key: 'value' })
  }
}

@suite('Route::JSON')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can return html response'() {
    const { code, data, headers } = await this.invoke('/', {})
    code.should.be.equal(200)
    headers['content-type']!.should.be.equal('application/json')
    data.should.be.a('string')
    const obj = JSON.parse(data)
    obj.should.have.property('key').that.has.is.equal('value')
  }
}

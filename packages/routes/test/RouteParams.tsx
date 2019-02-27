import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/:id'
  static async handler(this: RouteContext) {
    const id = this.request.params.id
    return this.json({ id: id })
  }
}

@suite('Route::Params')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can be invoked'() {
    const { code, data } = await this.invoke('GET', '/123456', {
      params: { id: 123456 },
    })
    code.should.be.equal(200)
    data.should.be.equal(JSON.stringify({ id: 123456 }))
  }
}

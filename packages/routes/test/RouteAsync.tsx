import { expect } from 'chai'
import { suite, test } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/:id'
  static async handler(this: RouteContext) {
    const done = await new Promise<string>((resolve, _reject) =>
      setTimeout(() => resolve('done'), 0)
    )
    this.text(done)
  }
}

@suite('Route::Async')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can be invoked'() {
    const { code, data } = await this.invoke('GET', '/123456', {
      params: { id: 123456 },
    })
    expect(code).to.be.equal(200)
    expect(data).to.be.equal('done')
  }
}

import 'chai/register-should'
import { blockParams } from 'handlebars'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static apiKey = '2135t'
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
  async 'no token does not work'() {
    const { code, data, headers } = await this.invoke('/', {})
    code.should.be.equal(500)
  }

  @test
  async 'token authing works'() {
    const { code, data, headers } = await this.invoke('/', {
      headers: { Authorization: 'Token 2135t' },
    })
    code.should.be.equal(200)
  }

  @test
  async 'token authing with wrong token does not work'() {
    const { code, data, headers } = await this.invoke('/', {
      headers: { Authorization: 'Token 3135t' },
    })
    code.should.be.equal(500)
  }
}

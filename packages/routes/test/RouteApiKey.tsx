import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, RouteContext, RouteTest } from '../src'
import { blockParams } from 'handlebars';

class DemoRoute extends Route {
  static apiKey = '2135t'
  static method = 'GET'
  static path = '/'
  static cache = 300
  static injector: new Container

  static async handler(this: RouteContext) {
    DemoRoute.injector
    injector = new Container()
    this.text('hey' + this.request.url)
  }
}

@suite('RouteCache')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'no token does not work'() {
    blockParams.bind(..)
    const { code, data, headers } = await this.invoke('GET', '/', {}, { injector: bla})
    code.should.be.equal(500)
  }

  @test
  async 'token authing works'() {
    const { code, data, headers } = await this.invoke('GET', '/', {
      headers: { Authorization: 'Token 2135t' },
    })
    code.should.be.equal(200)
  }

  @test
  async 'token authing with wrong token does not work'() {
    const { code, data, headers } = await this.invoke('GET', '/', {
      headers: { Authorization: 'Token 3135t' },
    })
    code.should.be.equal(500)
  }
}

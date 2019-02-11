import 'chai/register-should'
import * as express from 'express'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { Route, RouteContext, RouteTest } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  static async handler(this: RouteContext) {
    return this.text('demo route')
  }
}

class DemoRoute2 extends Route {
  static method = 'GET'
  static path = '/api'
  static async handler(this: RouteContext) {
    return this.text('demo route2')
  }
}

@suite('Route::Registration')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'can register to app object'() {
    const handlers: any[] = []
    const app = { get: (path: string, fn: any) => handlers.push({ path, fn }) }
    this.route.register(app as any)
    handlers.length.should.be.equal(1)
    handlers[0].path.should.be.equal('/')
  }

  @test
  async 'route registered to router can be called'() {
    const router = express.Router() as any
    DemoRoute.register(router)
    DemoRoute2.register(router)

    const request = httpMocks.createRequest({ method: 'GET', url: '/api' })
    const response = httpMocks.createResponse()
    router.handle(request, response, undefined)
    response._getData().should.be.equal('demo route2')
  }
}

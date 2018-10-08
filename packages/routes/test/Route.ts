import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { Route } from '../src'

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  async handler() {
    return this.text('demo route')
  }
}

@suite('Route')
export class Test {
  route = DemoRoute

  @test
  async 'can be instantiated and executed'() {
    const request = httpMocks.createRequest({ method: 'GET', url: '/' })
    const response = httpMocks.createResponse()
    const route = new DemoRoute(request, response)
    await route.handler()
    response._getData().should.be.equal('demo route')
    response.statusCode.should.be.equal(200)
  }
}

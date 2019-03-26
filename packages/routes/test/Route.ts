import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { HttpMethod, Route, RouteContext } from '../src'

class DemoRoute extends Route {
  static method: HttpMethod = 'GET'
  static path = '/'
  static async handler(this: RouteContext) {
    this.text('demo route')
  }
}

@suite('Route')
export class Test {
  route = DemoRoute

  @test
  async 'can be instantiated and executed'() {
    const request = httpMocks.createRequest({ method: 'GET', url: '/' })
    const response = httpMocks.createResponse()
    await DemoRoute.handle(request, response)
    response._getData().should.be.equal('demo route')
    response.statusCode.should.be.equal(200)
  }
}

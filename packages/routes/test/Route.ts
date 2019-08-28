import { expect } from 'chai'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { Route, RouteContext } from '../src'

class DemoRoute extends Route {
  static path = '/'
  static async handler(this: RouteContext) {
    this.text('demo route')
  }
}

@suite('Route')
export class Test {
  route = DemoRoute

  @test
  async 'default method is GET'() {
    expect(DemoRoute.method).to.equal('GET')
  }

  @test
  async 'can be instantiated and executed'() {
    const request = httpMocks.createRequest({ method: 'GET', url: '/' })
    const response = httpMocks.createResponse()
    await DemoRoute.handle(request, response)
    response._getData().should.be.equal('demo route')
    response.statusCode.should.be.equal(200)
  }
}

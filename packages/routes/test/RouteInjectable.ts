import { Http } from '@seagull/http'
import { expect } from 'chai'
import 'chai/register-should'
import { ContainerModule, injectable } from 'inversify'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { Route, RouteContext } from '../src'

class AutoInjectRoute extends Route {
  static path = '/'
  static dependencies = new ContainerModule(bind => {
    bind(DemoInjectable).toSelf()
  })
  static async handler(this: RouteContext) {
    const http = this.injector.get(Http)
    expect(http).to.be.an('object')
  }
}

@injectable()
class DemoInjectable {}

class InjectRoute extends Route {
  static path = '/'
  static dependencies = new ContainerModule(bind => {
    bind(DemoInjectable).toSelf()
  })
  static async handler(this: RouteContext) {
    const demo = this.injector.get(DemoInjectable)
    expect(demo).to.be.an('object')
  }
}

@suite('Route::Injectable')
export class Test {
  @test
  async 'has seagull auto-bindings'() {
    const request = httpMocks.createRequest({ method: 'GET', url: '/' })
    const response = httpMocks.createResponse()
    await AutoInjectRoute.handle(request, response)
  }

  @test
  async 'can bind injectable'() {
    const request = httpMocks.createRequest({ method: 'GET', url: '/' })
    const response = httpMocks.createResponse()
    await InjectRoute.handle(request, response)
  }
}

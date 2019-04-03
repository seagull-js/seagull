import { expect } from 'chai'
import 'chai/register-should'
import * as CV from 'class-validator'
import { EventEmitter } from 'events'
import * as express from 'express'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as httpMocks from 'node-mocks-http'
import { Route, RouteContext, RouteRequestProps, RouteTest } from '../src'

class RouteParams extends RouteRequestProps {
  // geter and setter (for example to convert string to num) are working like expected
  set numProp(value: any) {
    this._numProp = parseInt(value, 10)
  }
  get numProp() {
    return this._numProp
  }

  @CV.IsString() stringProp?: string
  optionalProp?: number

  // you can also validate internal properties
  @CV.IsNumber()
  // tslint:disable-next-line:variable-name
  private _numProp: number = 3
  private xyz = 'xyz'

  // test that functions do not conflict with .create
  iamafkt() {
    return this.xyz
  }
  iamanonfkt = () => 3
}

class DemoRoute extends Route {
  static path = '/:numProp'
  static async handler(this: RouteContext) {
    const params = RouteParams.fromRequest(this.request)
    return this.json({ ...params, numProp: params.numProp })
  }
}

@suite('Route::Request')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  'can be instantiated and executed'() {
    const props = RouteParams.create({ numProp: 3, stringProp: '' })
    expect(props).to.be.an('object')
  }
  @test
  async 'throws for invalid'() {
    const testCase = () =>
      RouteParams.create({ numProp: 3, stringProp: 3 } as any)
    expect(testCase).to.throw()
  }
  @test
  async 'supports custom constructors'() {
    class TestA extends RouteRequestProps {
      numProp = 3
      private param1: string
      constructor(param1: string, params2?: number) {
        super()
        this.param1 = param1
      }
      param = () => this.param1
    }
    const testA = TestA.create({ numProp: 5 }, 'param1')
    expect(testA.numProp).to.be.eq(5)
    expect(testA.param()).to.be.eq('param1')
  }

  @test
  async 'from request object'() {
    const router = express.Router() as any
    DemoRoute.register(router)

    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/33?stringProp=iamastring',
    })
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter })
    router.handle(request, response)
    await new Promise(resolve => response.on('end', resolve))

    const data = JSON.parse(response._getData())
    expect(data.numProp).to.be.equal(33)
    expect(data.stringProp).to.be.equal('iamastring')
  }
}

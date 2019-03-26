// tslint:disable:no-unused-expression
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import {
  HttpMethod,
  pathIsValid,
  Route,
  RouteContext,
  routeIsValid,
} from '../src'

class DemoRoute extends Route {
  static method: HttpMethod = 'GET'
  static path = '/'
  static async handler(this: RouteContext) {
    return this.text('hello world')
  }
}

@suite('Route::Validation')
export class Test {
  route = DemoRoute

  @test
  async 'can validate a route'() {
    routeIsValid(DemoRoute).should.be.true
  }

  @test
  async 'validate path works with *'() {
    pathIsValid('/*').should.be.true
    pathIsValid('/abc/d/*').should.be.true
    pathIsValid('/*/*').should.be.false
    pathIsValid('/**/*').should.be.false
    pathIsValid('/abc/**/d/*').should.be.false
    pathIsValid('*/*').should.be.false

    pathIsValid('/a/d*').should.be.false
    pathIsValid('*').should.be.false

    pathIsValid('/api/:id/post').should.be.true
  }

  @test
  async 'path has to start with /'() {
    pathIsValid('/').should.be.true
    pathIsValid('/abc/d').should.be.true
    pathIsValid('abc/D').should.be.false
  }

  @test
  async 'path can end with * but inside a constant'() {
    pathIsValid('/aa*').should.be.false
    pathIsValid('/aa/*').should.be.true
  }

  @test
  async 'path cannot have ?+()'() {
    pathIsValid('/hey?/a').should.be.false
    pathIsValid('/hey+/a').should.be.false
    pathIsValid('/he(y/a').should.be.false
    pathIsValid('/hey)/a').should.be.false
  }

  @test
  async 'catches common typos'() {
    pathIsValid('/jo//ha').should.be.false
    pathIsValid('/::hey').should.be.false
    pathIsValid('/a:a').should.be.false
    pathIsValid('/hey/a/**').should.be.false
    pathIsValid('/hey/:foo:bar').should.be.false
  }
}

import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { ReflectiveInjector } from 'injection-js'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http } from '../src'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}
@suite('Http::Cloud::Fetch')
export class Test extends BasicTest {
  injector = ReflectiveInjector.resolveAndCreate([Http])
  http = this.injector.get(Http)
  baseUrl = `https://postman-echo.com`

  @test
  async 'can get json'() {
    const method = 'get'
    const params = {
      foo1: 'bar1',
      foo2: 'bar2',
    }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
    const result = (await (await this.http.fetch(
      url
    )).json()) as ExpectedResponse
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }
}

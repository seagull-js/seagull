import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http } from '../../src'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::Mode::Cloud')
export class Test extends BasicTest {
  http = new Http()
  baseUrl = `https://postman-echo.com`
  method = 'get'
  params = { foo1: 'bar1', foo2: 'bar2' }
  url = `${this.baseUrl}/${this.method}?${querystring.stringify(this.params)}`

  @test
  async 'can get json'() {
    const result = (await (await this.http.fetch(
      this.url
    )).json()) as ExpectedResponse
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }
}

import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http, HttpError } from '../src'
use(promisedChai)

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::Cloud::Fetch')
export class Test extends BasicTest {
  http = new Http()
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

  @test
  async 'throws an HttpError'() {
    const method = 'undefined'
    const url = `${this.baseUrl}/${method}`
    const result = this.http.fetch(url)
    expect(result).to.be.rejectedWith(HttpError)
  }
}

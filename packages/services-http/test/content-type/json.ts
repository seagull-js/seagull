import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { HttpError, HttpJson } from '../../src'
import { HttpSeed } from '../../src/mode/seed'
use(promisedChai)
interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::ContentType::Json')
export class Test extends BasicTest {
  http = new HttpJson(new HttpSeed())
  baseUrl = `https://postman-echo.com`

  @test
  async 'throws an error when url not set'() {
    const request = this.http.get('')
    await expect(request)
      .to.eventually.be.rejectedWith(TypeError)
      .and.have.property('message', 'Only absolute URLs are supported')
  }

  @test
  async 'throws an error when response is 404'() {
    const request = this.http.get(`${this.baseUrl}/undefined`)
    await expect(request)
      .to.eventually.be.rejectedWith(HttpError)
      .and.have.property('message', 'Http error code 404: Not Found')
  }

  @test
  async 'can get json'() {
    const method = 'get'
    const params = {
      foo1: 'bar1',
      foo2: 'bar2',
    }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
    const result = await this.http.get<ExpectedResponse>(url)
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }
}

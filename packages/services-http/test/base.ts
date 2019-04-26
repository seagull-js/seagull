import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http } from '../src/mode/cloud'
use(promisedChai)

@suite('Http::Base::Fetch')
export class Test extends BasicTest {
  http = new Http()
  baseUrl = `https://postman-echo.com`

  @test
  async 'throws an error when url not set'() {
    const request = this.http.fetch('')
    await expect(request)
      .to.eventually.to.rejectedWith(TypeError)
      .and.have.property('message', 'Only absolute URLs are supported')
  }

  @test
  async 'can get 404 response'() {
    const method = 'undefined'
    const url = `${this.baseUrl}/${method}`
    const result = await this.http.fetch(url)
    expect(result).to.have.property('status', 404)
  }

  @test
  async 'can get json'() {
    const method = 'get'
    const params = {
      foo1: 'bar1',
      foo2: 'bar2',
    }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
    const result = (await (await this.http.get(url)).json()) as any
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }

  @test
  async 'can post json'() {
    const method = 'post'
    const body = 'foobar'
    const url = `${this.baseUrl}/${method}`
    const result = (await (await this.http.post(url, {
      body,
    })).json()) as any
    expect(result).to.be.an('object')
    expect(result.data).to.equal(body)
  }
}

import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { ReflectiveInjector } from 'injection-js'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http, HttpSeed } from '../../src'

@suite('Http::Base::Fetch')
export class Test extends BasicTest {
  injector = ReflectiveInjector.resolveAndCreate([
    { provide: Http, useClass: HttpSeed },
  ])
  http = this.injector.get(Http) as Http
  baseUrl = `https://postman-echo.com`

  @test
  async 'throws error when url not set'() {
    try {
      const response = await this.http.fetch('')
      expect(response).not.to.be.an('object') // should never be called
    } catch (e) {
      expect(e.message).to.be.equal('Only absolute URLs are supported')
    }
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

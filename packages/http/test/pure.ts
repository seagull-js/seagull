import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { ReflectiveInjector } from 'injection-js'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http, HttpPure } from '../src'

@suite('Http::Request::Pure')
export class Test extends BasicTest {
  static before() {
    // delete old seed
    const path =
      './seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default.json'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
  }

  injector = ReflectiveInjector.resolveAndCreate([
    {
      provide: Http,
      useClass: HttpPure,
    },
  ])
  http = this.injector.get(Http) as Http
  baseUrl = `https://postman-echo.com`

  @test
  async 'throws error when seed is not available'() {
    try {
      const method = 'get'
      const params = {
        foo1: 'bar1',
        foo2: 'bar2',
      }
      const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
      const response = (await (await this.http.fetch(
        url
      )).json()) as ExpectedResponse
      expect(response).not.to.be.an('object') // should never be called
    } catch (e) {
      expect(e.message).to.be.equal('Http: fixture (seed) is missing.')
    }
  }
}

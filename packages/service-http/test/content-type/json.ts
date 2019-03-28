import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { Container } from 'inversify'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { Http } from '../../src'
import { HttpJson } from '../../src'
import { HttpSeed } from '../../src/modes/seed'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::Json')
export class Test extends BasicTest {
  http = new HttpJson(new HttpSeed())
  baseUrl = `https://postman-echo.com`

  @test
  async 'can get json'() {
    const method = 'get'
    const params = {
      foo1: 'bar1',
      foo2: 'bar2',
    }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
    const result = await this.http.get<ExpectedResponse>(url)
    // console.info('result', result)
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }

  // TODO: inject mock for following tests:

  //  @test
  //  async 'throws response when status is not 200'() {
  //    const response = new Response('error', { status: 404 })
  //
  //    const fetch: (
  //      url: string | NodeRequest,
  //      init?: RequestInit | undefined
  //    ) => Promise<Response> = () => {
  //      return Promise.resolve(response)
  //    }
  //
  //    const config: RequestConfig = {
  //      init: {
  //        headers: {
  //          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
  //        },
  //        timeout: 30000,
  //      },
  //      parseBody: 'text',
  //      url: this.url,
  //    }
  //    const request = new Http.Request<Foo>(config, fetch)
  //
  //    request.mode = { ...request.mode, environment: 'cloud' }
  //
  //    try {
  //      await request.execute()
  //      expect.fail('request should throw error')
  //    } catch (e) {
  //      expect(e).to.deep.equal(response)
  //    }
  //  }
  //
  //  @test
  //  async 'propagates the error from fetch'() {
  //    const fetch: (
  //      url: string | NodeRequest,
  //      init?: RequestInit | undefined
  //    ) => Promise<Response> = () => {
  //      return Promise.reject(new Error('broken'))
  //    }
  //
  //    const config: RequestConfig = {
  //      init: {
  //        headers: {
  //          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
  //        },
  //        timeout: 30000,
  //      },
  //      parseBody: 'text',
  //      url: this.url,
  //    }
  //    const request = new Http.Request<Foo>(config, fetch)
  //
  //    request.mode = { ...request.mode, environment: 'cloud' }
  //
  //    try {
  //      await request.execute()
  //      expect.fail('request should throw error')
  //    } catch (e) {
  //      expect(e.message).to.equal('broken')
  //    }
  //  }
}

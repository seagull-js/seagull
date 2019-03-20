import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { HttpPure } from '../src/modes/pure'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::Pure::Fetch')
export class Test extends BasicTest {
  http = new HttpPure()
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
  async 'throws error when seed is not available'() {
    // delete old seed
    const path =
      './seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default.json'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

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

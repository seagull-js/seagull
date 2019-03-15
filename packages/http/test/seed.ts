import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { HttpPure, HttpSeed } from '../src'

@suite('Http::Request::Seed')
export class Test extends BasicTest {
  httpSeed = new HttpSeed()
  httpPure = new HttpPure()
  baseUrl = `https://postman-echo.com`

  @test
  async 'can get seed fixture'() {
    // delete old fixture
    const path =
      './seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default.json'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    // seed fixture
    const method = 'get'
    const params = {
      foo1: 'bar1',
      foo2: 'bar2',
    }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`
    const seedResponse = (await (await this.httpSeed.fetch(
      url
    )).json()) as ExpectedResponse
    expect(seedResponse).to.be.an('object')
    expect(seedResponse.args).to.have.ownProperty('foo1')
    expect(seedResponse.args).to.have.ownProperty('foo2')

    // get fixture
    const pureResponse = (await (await this.httpPure.fetch(
      url
    )).json()) as ExpectedResponse
    expect(pureResponse).to.be.an('object')
    expect(pureResponse.args).to.have.ownProperty('foo1')
    expect(pureResponse.args).to.have.ownProperty('foo2')
  }
}

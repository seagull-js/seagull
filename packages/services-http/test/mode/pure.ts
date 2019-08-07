import { SeedError } from '@seagull/seed'
import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import { HttpPure } from '../../src/mode/pure'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('Http::Mode::Pure')
export class Test extends BasicTest {
  http = new HttpPure()
  baseUrl = `https://postman-echo.com`
  method = 'get'
  params = { foo1: 'bar1', foo2: 'bar2' }
  url = `${this.baseUrl}/${this.method}?${querystring.stringify(this.params)}`
  path = './seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default.json'

  @test
  async 'can get json'() {
    const result = (await (await this.http.fetch(
      this.url
    )).json()) as ExpectedResponse
    expect(result).to.be.an('object')
    expect(result.args).to.have.ownProperty('foo1')
    expect(result.args).to.have.ownProperty('foo2')
  }

  @test
  async 'throws error when seed is not available'() {
    // seed should be empty
    if (fs.existsSync(this.path)) {
      fs.unlinkSync(this.path)
    }

    const request = this.http.fetch(this.url)
    await expect(request)
      .to.eventually.be.rejectedWith(SeedError)
      .and.have.property(
        'message',
        'Fixture (seed) is missing: seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default.json.'
      )
  }
}

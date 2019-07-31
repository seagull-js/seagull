// tslint:disable: no-unused-expression
import { ServiceTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import * as rimraf from 'rimraf'
import { HttpPure } from '../../src/mode/pure'
import { HttpSeed } from '../../src/mode/seed'
interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}
@suite('Http::Mode::State')
export class Test extends ServiceTest {
  static after() {
    rimraf.sync(`./seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2`)
  }

  serviceModules = []
  services = [HttpSeed, HttpPure]
  stateful = true
  baseUrl = `https://postman-echo.com`

  @test
  async 'can create stateful seed fixture'() {
    const httpSeed = this.injector.get(HttpSeed)
    const path = (idx: number) =>
      `./seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default/` +
      `suite-httpmodestate/can-create-stateful-seed-fixture/` +
      `request-${idx}.json`

    // seed should be empty
    expect(fs.existsSync(path(0))).to.be.false
    expect(fs.existsSync(path(1))).to.be.false

    const method = 'get'
    const params = { foo1: 'bar1', foo2: 'bar2' }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`

    // seed fixture 0
    await httpSeed.fetch(url)
    expect(fs.existsSync(path(0)), `fixture 0 file not found`).to.be.true

    // seed fixture 1
    await httpSeed.fetch(url)
    expect(fs.existsSync(path(1)), `fixture 1 file not found`).to.be.true
  }

  @test
  async 'can get stateful seed fixture'() {
    const path =
      `./seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/default/` +
      `suite-httpmodestate/can-get-stateful-seed-fixture/` +
      `request-0.json`
    const method = 'get'
    const params = { foo1: 'bar1', foo2: 'bar2' }
    const url = `${this.baseUrl}/${method}?${querystring.stringify(params)}`

    // seed should be empty
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    // seed fixture 0
    const httpSeed = this.injector.get(HttpSeed)
    await httpSeed.fetch(url)
    expect(fs.existsSync(path), `fixture 0 file not found`).to.be.true

    // get fixture 0
    const httpPure = this.injector.get(HttpPure)
    const pureResponse = (await (await httpPure.fetch(
      url
    )).json()) as ExpectedResponse
    expect(pureResponse).to.be.an('object')
    expect(pureResponse.args).to.have.ownProperty('foo1')
    expect(pureResponse.args).to.have.ownProperty('foo2')
  }
}

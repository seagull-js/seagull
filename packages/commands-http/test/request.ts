import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Http, RequestConfig } from '../../src/commands-http'

@suite('Http::Request')
export class Test extends BasicTest {
  mocks = []
  url = `https://postman-echo.com/get?foo1=bar1&foo2=bar2`

  @test
  async 'can query url'() {
    const config: RequestConfig = {      
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      url: this.url,
    }
    // expect error
    try {
      await new Http.Request<any>(config).execute()
    } catch (e) {
      expect(e.message).to.be.equal('HttpCommand: fixture (seed) is missing.')
    }
  }

  @test
  async 'can fetch/has seed fixture'() {
    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      url: this.url
    }
    Http.fetchPureSeed = true // careful, global state!
    const response = await new Http.Request<any>(config).execute()
    Http.fetchPureSeed = false
    expect(response).to.be.an('object')
    expect(response.args).to.have.ownProperty('foo1')
    expect(response.args).to.have.ownProperty('foo2')
  }
}

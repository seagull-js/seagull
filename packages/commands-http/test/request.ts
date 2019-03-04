import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Http, RequestConfig } from '../src'

@suite('Http::Request')
export class Test extends BasicTest {
  static before() {
    // delete old seed
    const path =
      './seed/https/postman-echo.com/get?foo1=bar1&foo2=bar2/52fa6ffea34dce49d541d2a6d16b701f'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
  }

  mocks = []
  url = `https://postman-echo.com/get?foo1=bar1&foo2=bar2`

  @test
  async 'throws error when seed is not available'() {
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
      const response = await new Http.Request<any>(config).execute()
      // expect(response).not.to.be.an('object') // should never be called
    } catch (e) {
      expect(e.message).to.be.equal('HttpCommand: fixture (seed) is missing.')
    }
  }

  @test
  async 'can fetch seed fixture'() {
    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      url: this.url,
    }
    Http.fetchPureSeed = true // careful, global state!
    const response = await new Http.Request<any>(config).execute()
    Http.fetchPureSeed = false
    expect(response).to.be.an('object')
    expect(response.args).to.have.ownProperty('foo1')
    expect(response.args).to.have.ownProperty('foo2')
  }

  @test
  async 'can return seed when available'() {
    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      url: this.url,
    }
    const response = await new Http.Request<any>(config).execute()
    expect(response).to.be.an('object')
    expect(response.args).to.have.ownProperty('foo1')
    expect(response.args).to.have.ownProperty('foo2')
  }
}

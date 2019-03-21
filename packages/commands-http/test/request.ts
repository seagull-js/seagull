import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { suite, test, timeout } from 'mocha-typescript'
import {
  Headers,
  Request as NodeRequest,
  RequestInit,
  Response,
} from 'node-fetch'
import * as Path from 'path'
import { Http, RequestConfig } from '../src'

interface Foo {
  foo: number
}

@suite('Http::Request::Pure')
export class PureTest extends BasicTest {
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
      await new Http.Request<any>(config).execute()
      expect.fail('request should throw error')
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

  // TODO: test encoding functionality
}
@suite('Http::Request::Cloud')
export class CloudTest extends BasicTest {
  url = `https://postman-echo.com/get?foo1=bar1&foo2=bar2`

  @test
  async 'converts response to json by default'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(new Response('{"foo":42}'))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      url: this.url,
    }
    const request = new Http.Request<Foo>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    const response = await request.execute()

    const expected: Foo = { foo: 42 }

    expect(response).to.deep.equal(expected)
  }

  @test
  async 'converts response to json when requested'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(new Response('{"foo":42}'))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'json',
      url: this.url,
    }
    const request = new Http.Request<Foo>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    const response = await request.execute()

    const expected: Foo = { foo: 42 }

    expect(response).to.deep.equal(expected)
  }

  @test
  async 'converts response to base64 when requested'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(new Response(Buffer.from('{"foo":42}')))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'base64',
      url: this.url,
    }
    const request = new Http.Request<string>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    const response = await request.execute()

    const expected: string = 'eyJmb28iOjQyfQ=='

    expect(response).to.deep.equal(expected)
  }

  @test
  async 'converts response to text when requested'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(new Response(Buffer.from('{"foo":42}')))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'text',
      url: this.url,
    }
    const request = new Http.Request<string>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    const response = await request.execute()

    const expected: string = '{"foo":42}'

    expect(response).to.deep.equal(expected)
  }

  @timeout(30000)
  @test
  async 'converts response to utf8 text'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return new Promise((resolve, reject) => {
        fs.readFile(Path.join(__dirname + '/iso8859.txt'), (err, data) => {
          if (err) {
            reject(err)
            return
          }
          resolve(
            new Response(data, {
              headers: new Headers({
                'Content-Type': 'text/html; charset=iso-8859-1',
              }),
              status: 200,
            })
          )
        })
      })
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'text',
      url: this.url,
    }
    const request = new Http.Request<string>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    const response = await request.execute()

    const expected: string = 'äöüÄÖÜß abc'

    expect(response).to.deep.equal(expected)
  }

  @test
  async 'does not yet support parsed xml body'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(new Response('{"foo":42}'))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'xml',
      url: this.url,
    }
    const request = new Http.Request<Foo>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    try {
      await request.execute()
      expect.fail('request should throw error')
    } catch (e) {
      expect(e.message).to.be.equal('not implemented')
    }
  }

  @test
  async 'throws response when status is not 200'() {
    const response = new Response('error', { status: 404 })

    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.resolve(response)
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'text',
      url: this.url,
    }
    const request = new Http.Request<Foo>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    try {
      await request.execute()
      expect.fail('request should throw error')
    } catch (e) {
      expect(e).to.deep.equal(response)
    }
  }

  @test
  async 'propagates the error from fetch'() {
    const fetch: (
      url: string | NodeRequest,
      init?: RequestInit | undefined
    ) => Promise<Response> = () => {
      return Promise.reject(new Error('broken'))
    }

    const config: RequestConfig = {
      init: {
        headers: {
          Accept: 'application/vnd.sdmx.data+json;version=1.0.0-wd',
        },
        timeout: 30000,
      },
      parseBody: 'text',
      url: this.url,
    }
    const request = new Http.Request<Foo>(config, fetch)

    request.mode = { ...request.mode, environment: 'cloud' }

    try {
      await request.execute()
      expect.fail('request should throw error')
    } catch (e) {
      expect(e.message).to.equal('broken')
    }
  }
}

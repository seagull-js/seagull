import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'
import { chdir, cwd } from 'process'

@suite('Dispatching Requests Works')
class DispatchTests {
  @test
  async 'simple dispatch returns text response'() {
    const exampleRequest = { path: '/greet' }
    const handler = require(join(__dirname, 'example', 'Greet.js')).default
    const response = await handler.dispatchPromise(exampleRequest, {})
    response.body.should.to.be.equal('hello world')
  }

  @test
  async 'simple text response with dynamic query params works'() {
    const exampleRequest = {
      path: '/greet',
      queryStringParameters: { name: 'max' },
    }
    const handler = require(join(__dirname, 'example', 'Greet.js')).default
    const response = await handler.dispatchPromise(exampleRequest, {})
    response.body.should.to.be.equal('hello max')
  }

  @test
  async 'dispatching real lambda calls works'() {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      pathParameters: {},
      queryStringParameters: {},
    }
    const api = require(join(__dirname, 'example', 'Greet.js')).handler()
    const response: any = await new Promise((resolve, reject) => {
      api(event, null, (error, result) => {
        error ? reject(error) : resolve(result)
      })
    })
    response.body.should.to.be.equal('hello world')
  }

  @test
  async 'an api without cache sets cache-control to no-cache'() {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      pathParameters: {},
      queryStringParameters: {},
    }
    const api = require(join(__dirname, 'example', 'Greet.js')).handler()
    const { headers }: { headers: object } = (await new Promise(
      (resolve, reject) => {
        api(event, null, (error, result) => {
          error ? reject(error) : resolve(result)
        })
      }
    )) as any
    headers.should.be.an('object')
    headers.should.have.property('Cache-Control')
    headers['Cache-Control'].should.equal('no-cache, no-store')
  }

  @test
  async 'an api with cache sets cache-control to max-age={seconds}'() {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      pathParameters: {},
      queryStringParameters: {},
    }
    const apiModule = require(join(__dirname, 'example', 'GreetCached.js'))

    const api = apiModule.handler()
    const { headers }: { headers: object } = (await new Promise(
      (resolve, reject) => {
        api(event, null, (error, result) => {
          error ? reject(error) : resolve(result)
        })
      }
    )) as any
    headers.should.be.an('object')
    headers.should.have.property('Cache-Control')
    headers['Cache-Control'].should.equal(`max-age=${apiModule.default.cache}`)
  }
}

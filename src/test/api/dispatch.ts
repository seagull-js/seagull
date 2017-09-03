import { expect } from 'chai'
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
    expect(response.body).to.be.equal('hello world')
  }

  @test
  async 'simple text response with dynamic query params works'() {
    const exampleRequest = {
      path: '/greet',
      queryStringParameters: { name: 'max' },
    }
    const handler = require(join(__dirname, 'example', 'Greet.js')).default
    const response = await handler.dispatchPromise(exampleRequest, {})
    expect(response.body).to.be.equal('hello max')
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
    expect(response.body).to.be.equal('hello world')
  }
}

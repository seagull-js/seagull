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
}

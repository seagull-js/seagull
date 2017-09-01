import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Request from '../../lib/api/request'
import ExampleAPI from './example/Greet'

@suite('Default API handlers work')
class ApiHandlers {
  @test
  async 'simple text response works'() {
    const api = new ExampleAPI()
    const request = new Request('GET', '/greet', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.equal('hello world')
  }

  @test
  async 'simple text response works with query param'() {
    const api = new ExampleAPI()
    const request = new Request('GET', '/greet', { name: 'Max' }, {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.equal('hello Max')
  }
}

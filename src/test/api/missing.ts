import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Request from '../../lib/api/request'
import ExampleAPI from './example/NotFound'

@suite('API Missing handlers work')
class RedirectApiHandlers {
  @test
  async 'missing response is correct'() {
    const api = new ExampleAPI()
    const request = new Request('GET', '/missing', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(404)
    expect(response.body).to.be.equal('nope!')
  }
}

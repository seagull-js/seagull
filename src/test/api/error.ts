import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Request from '../../lib/api/request'
import ExampleAPI from './example/Error'

@suite('API Error handlers work')
class ErrorApiHandlers {
  @test
  async 'error response is correct'() {
    const api = new ExampleAPI()
    const request = new Request('GET', '/error', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(500)
    expect(response.body).to.be.equal('fail!')
  }
}

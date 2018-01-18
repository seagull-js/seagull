import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Request from '../../lib/api/request'
import ExampleAPI from './example/Post'

@suite('POST JSON API handlers work')
class PostJsonApiHandlers {
  @test
  async 'simple text response works'() {
    const api = new ExampleAPI()
    const payload = JSON.stringify({ name: 'Dude' })
    const request = new Request('POST', '/save', {}, payload)
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.equal('hello Dude')
  }
}

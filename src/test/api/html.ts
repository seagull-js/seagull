import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Request from '../../lib/api/request'
import Frontend from './example/Frontend'

@suite('Content API handlers work')
class ContentApiHandlers {
  @test
  async 'simple html ssr response works'() {
    const api = new Frontend()
    const request = new Request('GET', '/', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.include('Hello World!')
  }

  @test.skip
  async 'catchall route html ssr response works'() {
    const api = new Frontend()
    const request = new Request('GET', '/this/does/not/exist', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.include('catch-all')
  }
}

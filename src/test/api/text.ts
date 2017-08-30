import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import API from '../../lib/api'
import Request from '../../lib/api/request'
import Response from '../../lib/api/response'

// demo class
class ExampleRoute extends API {
  method: 'GET'
  async handle(request: Request): Promise<Response> {
    const name = request.params.name || 'world'
    return this.text(`hello ${name}`)
  }
}

// tslint:disable-next-line:max-classes-per-file
@suite('Default API handlers work')
class ApiHandlers {

  @test('simple text response works')
  async canReplyWithTextData() {
    const api = new ExampleRoute()
    const request = new Request('GET', '/', {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.equal('hello world')
  }

  @test('simple text response works with query param')
  async canReplyWithQueriedTextData() {
    const api = new ExampleRoute()
    const request = new Request('GET', '/', { name: 'Max' }, {})
    const response = await api.handle(request)
    expect(response.statusCode).to.be.equal(200)
    expect(response.body).to.be.equal('hello Max')
  }

}

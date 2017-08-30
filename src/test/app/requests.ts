import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

import GetRequest from '../../lib/app/get_request'
import PostRequest from '../../lib/app/post_request'

@suite
class AppRequests {
  @test('can create GET request object from data')
  canCreateGetRequest() {
    const url = 'http://example.com/test/hello?foo=bar#42'
    const request = new GetRequest(url, '')
    expect(request.path).to.be.equal('/test/hello')
    expect(request.params.query).to.have.key('foo')
    expect(request.params.query.foo).to.be.equal('bar')
    expect(request.params.hash).to.have.key('42')
  }
}

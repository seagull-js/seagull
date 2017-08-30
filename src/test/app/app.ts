import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

import App from '../../lib/app'

@suite
class AppTest {
  @test('basic DSL works for backend routes')
  basicDslWorksForBackendRoutes() {
    const app = new App('Demo App')
      .get('/hello', async req => 'world')
      .post('/items', async req => 'hello')
    expect(app).to.be.an('object')
    expect(app.backend).to.an('array')
    expect(app.backend.length).to.be.equal(2)
    expect(app.backend[0].method).to.be.equal('GET')
    expect(app.backend[0].path).to.be.equal('/hello')
    expect(app.backend[1].method).to.be.equal('POST')
    expect(app.backend[1].path).to.be.equal('/items')
  }
}

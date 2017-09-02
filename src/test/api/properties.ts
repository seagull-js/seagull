import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import ExampleAPI from './example/Greet'

@suite('Handlers expose correct properties')
class HandlersTest {
  @test
  async path() {
    expect(ExampleAPI.path).to.be.equal('/greet')
    const api = new ExampleAPI()
    expect(api.path).to.be.a('function')
    expect(api.path()).to.be.equal('/greet')
  }

  @test
  async method() {
    expect(ExampleAPI.method).to.be.equal('GET')
    const api = new ExampleAPI()
    expect(api.method).to.be.a('function')
    expect(api.method()).to.be.equal('GET')
  }

  @test
  async cors() {
    expect(ExampleAPI.cors).to.be.equal(false)
    const api = new ExampleAPI()
    expect(api.cors).to.be.a('function')
    expect(api.cors()).to.be.equal(false)
  }
}

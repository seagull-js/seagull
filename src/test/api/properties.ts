import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import ExampleAPI from './example/Greet'

@suite('Handlers expose correct properties')
class HandlersTest {
  @test
  async path() {
    expect(ExampleAPI.path).to.be.equal('/greet')
  }

  @test
  async method() {
    expect(ExampleAPI.method).to.be.equal('GET')
  }

  @test
  async cors() {
    expect(ExampleAPI.cors).to.be.equal(false)
  }
}

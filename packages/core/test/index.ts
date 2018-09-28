import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite('Core')
export class Test {
  @test
  async 'the truth'() {
    'hello'.should.be.equal('hello')
  }
}

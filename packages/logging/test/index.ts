import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { info, messages } from '../src'

@suite('Logging')
export class Test {
  @test.skip
  async 'read events from stash when in test mode'() {
    info('srv', 'data!')
    messages().should.be.deep.equal('a')
  }
}

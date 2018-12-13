import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { Sandbox } from '../src'

@suite('Sandbox::Sandbox')
export class Test {
  @test
  async 'there is a sandbox singleton'() {
    // tslint:disable-next-line:no-unused-expression
    Sandbox.should.exist
  }
}

import { TslintJsonGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Json::JsonTslint')
export class Test {
  @test
  'can be initialized'() {
    const gen = TslintJsonGenerator()
    gen.should.be.an('object')
  }
}

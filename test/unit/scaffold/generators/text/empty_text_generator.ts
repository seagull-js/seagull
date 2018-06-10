import { EmptyTextGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Text::EmptyTextGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = EmptyTextGenerator()
    gen.should.be.an('object')
  }

  @test
  'has NO text value'() {
    const gen = EmptyTextGenerator()
    const text = gen.toString()
    text.should.be.equal('')
  }
}

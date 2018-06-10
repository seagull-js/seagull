import { GitignoreTextGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Text::GitignoreTextGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = GitignoreTextGenerator()
    gen.should.be.an('object')
  }

  @test
  'has default values'() {
    const gen = GitignoreTextGenerator()
    const text = gen.toString()
    text.should.contain('.seagull')
    text.should.contain('node_modules')
  }

  @test
  'defaults can be overwritten'() {
    const gen = GitignoreTextGenerator(['a', 'b'])
    const text = gen.toString()
    text.should.contain('a')
    text.should.contain('b')
  }
}

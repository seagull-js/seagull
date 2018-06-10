import { ExportsGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Code::ExportsGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = ExportsGenerator(['.'])
    gen.should.be.an('object')
  }

  @test
  'can write multiple export lines'() {
    const gen = ExportsGenerator(['./a', './b'], true)
    gen.should.be.an('object')
    const code = gen.toString()
    code.should.contain(`export * from './a'`)
    code.should.contain(`export * from './b'`)
  }

  @test
  'can write named default exports '() {
    const gen = ExportsGenerator(['./a', './b'])
    gen.should.be.an('object')
    const code = gen.toString()
    code.should.contain(`export { default as A } from './a'`)
    code.should.contain(`export { default as B } from './b'`)
  }
}

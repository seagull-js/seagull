import { AtomGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::AtomGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = AtomGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = AtomGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Atom } from')
    code.should.contain('export interface IButtonProps')
    code.should.contain('class Button extends Atom<IButtonProps>')
  }
}

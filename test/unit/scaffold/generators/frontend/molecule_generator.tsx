import { MoleculeGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::MoleculeGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = MoleculeGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = MoleculeGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Molecule } from')
    code.should.contain('export interface IButtonProps')
    code.should.contain('class Button extends Molecule<IButtonProps>')
  }
}

import { OrganismGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::OrganismGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = OrganismGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = OrganismGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Organism } from')
    code.should.contain('export interface IButtonProps')
    code.should.contain('class Button extends Organism<IButtonProps>')
  }
}

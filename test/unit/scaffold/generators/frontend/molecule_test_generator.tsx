import { MoleculeTestGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::MoleculeTestGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = MoleculeTestGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = MoleculeTestGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Molecule, MoleculeTest } from')
    code.should.contain(`import 'chai/register-should'`)
    code.should.contain(`@suite('Unit::Frontend::Molecules::Button')`)
    code.should.contain('class Test extends MoleculeTest<Button>')
  }
}

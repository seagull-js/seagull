import { AtomTestGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::AtomTestGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = AtomTestGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = AtomTestGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Atom, AtomTest } from')
    code.should.contain(`import 'chai/register-should'`)
    code.should.contain(`@suite('Unit::Frontend::Atoms::Button')`)
    code.should.contain('class Test extends AtomTest<Button>')
  }
}

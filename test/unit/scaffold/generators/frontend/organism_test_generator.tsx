import { OrganismTestGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::OrganismTestGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = OrganismTestGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = OrganismTestGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Organism, OrganismTest } from')
    code.should.contain(`import 'chai/register-should'`)
    code.should.contain(`@suite('Unit::Frontend::Organisms::Button')`)
    code.should.contain('class Test extends OrganismTest<Button>')
  }
}

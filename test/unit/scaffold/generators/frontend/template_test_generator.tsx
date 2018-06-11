import { TemplateTestGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::TemplateTestGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = TemplateTestGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = TemplateTestGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Template, TemplateTest } from')
    code.should.contain(`import 'chai/register-should'`)
    code.should.contain(`@suite('Unit::Frontend::Templates::Button')`)
    code.should.contain('class Test extends TemplateTest<Button>')
  }
}

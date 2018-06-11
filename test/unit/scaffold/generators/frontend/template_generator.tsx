import { TemplateGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::TemplateGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = TemplateGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = TemplateGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Template } from')
    code.should.contain('export interface IButtonProps')
    code.should.contain('class Button extends Template<IButtonProps>')
  }
}

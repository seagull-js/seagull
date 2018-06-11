import { PageTestGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::PageTestGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = PageTestGenerator('Button')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = PageTestGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Page, PageTest } from')
    code.should.contain(`import 'chai/register-should'`)
    code.should.contain(`@suite('Unit::Frontend::Pages::Button')`)
    code.should.contain('class Test extends PageTest<Button>')
  }
}

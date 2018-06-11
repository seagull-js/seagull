import { PageGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Frontend::PageGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = PageGenerator('DemoPage')
    gen.should.be.an('object')
  }

  @test
  'respects to the components name'() {
    const gen = PageGenerator('Button')
    const code = gen.toString()
    code.should.contain('import { Page } from')
    code.should.contain('class Button extends Page')
  }
}

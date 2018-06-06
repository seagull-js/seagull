import { Class } from '@scaffold'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold:Class')
class Test {
  @test
  'can be initialized'() {
    const gen = new Class('MyClass')
    expect(gen).to.be.an('object')
  }

  @test
  'can add imports to class file'() {
    const gen = new Class('MyClass')
    gen.addDefaultImport('moduleName', 'Mod')
    gen.addNamedImports('mod', ['a', 'b'])
    const code = gen.toString()
    expect(code).to.contain(`import Mod from 'moduleName'`)
  }

  @test
  'can add properties to class'() {
    const gen = new Class('MyClass')
    gen.addProp({ name: 'counter', type: 'number', value: '0' })
    gen.addProp({ name: 'title', type: 'string', value: `'bla'`, static: true })
    const code = gen.toString()
    expect(code).to.contain(`counter: number = 0`)
    expect(code).to.contain(`static title: string = 'bla'`)
  }

  @test
  'can add methods to class'() {
    const gen = new Class('MyClass')
    const parameter = [{ name: 'a', type: 'string' }]
    gen.addMethod({ name: 'm1', parameter, static: true })
    gen.addMethod({ name: 'm2', body: `return 'hello'`, async: true })
    const code = gen.toString()
    expect(code).to.contain(`static m1(a: string) {}`)
    expect(code).to.contain(`async m2() {`)
    expect(code).to.contain(`return 'hello'`)
  }
}

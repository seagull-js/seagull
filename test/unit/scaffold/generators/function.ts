import { Function as GenFunction } from '@scaffold/generators'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::Function')
class Test {
  @test
  'can be initialized'() {
    const gen = new GenFunction('MyFunction')
    expect(gen).to.be.an('object')
  }

  @test
  'can have untyped param'() {
    const gen = new GenFunction('MyFunction')
    gen.addParam('a')
    const code = gen.toString()
    expect(code).to.contain('export default function MyFunction(a) {}')
  }

  @test
  'can have typed param'() {
    const gen = new GenFunction('MyFunction')
    gen.addParam('s', 'string')
    const code = gen.toString()
    expect(code).to.contain('export default function MyFunction(s: string) {}')
  }

  @test
  'can have destructured param'() {
    const gen = new GenFunction('MyFunction')
    gen.addParam('{ children }')
    const code = gen.toString()
    expect(code).to.contain('function MyFunction({ children }) {}')
  }

  @test
  'can have explicit return type'() {
    const gen = new GenFunction('MyFunction')
    gen.setReturnType('string')
    const code = gen.toString()
    expect(code).to.contain('function MyFunction(): string {}')
  }

  @test
  'can have simple body written inline'() {
    const gen = new GenFunction('MyFunction')
    gen.setBodyText('return "hello world!"')
    const code = gen.toString()
    expect(code).to.contain(`{\n  return 'hello world!'\n}`)
  }

  @test
  'can have complex body written incrementally'() {
    const gen = new GenFunction('MyFunction')
    gen.setBodyComplex(writer => {
      writer
        .writeLine('const a = 3')
        .write('if (a === 5)')
        .block(() => {
          writer.writeLine('alert("fail!")')
        })
        .writeLine('else')
        .block(() => {
          writer.writeLine('alert("throw")')
        })
    })
    const code = gen.toString()
    expect(code).to.contain(`if (a === 5) {\n    alert('fail!')\n  }`)
    expect(code).to.contain(`else {\n    alert('throw')\n  }\n`)
  }
}

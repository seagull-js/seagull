import { JsonPackage } from '@scaffold/generators'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::JsonPackage')
class Test {
  @test
  'can be initialized'() {
    const gen = JsonPackage('demo', '0.1.2')
    expect(gen).to.be.an('object')
  }

  @test
  'name gets passed into file'() {
    const gen = JsonPackage('demo', '0.1.2')
    const code = gen.toString()
    expect(code).to.contain(`"name": "demo"`)
  }

  @test
  'sets dev deps for the end user'() {
    const gen = JsonPackage('demo', '0.1.2')
    const code = gen.toString()
    expect(code).to.contain(`"aws-sdk": "^2.104.0"`)
    expect(code).to.contain(`"typescript": "^2.9.0"`)
  }
}

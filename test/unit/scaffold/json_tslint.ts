import { JsonTslint } from '@scaffold'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::JsonTslint')
class Test {
  @test
  'can be initialized'() {
    const gen = JsonTslint()
    expect(gen).to.be.an('object')
  }
}

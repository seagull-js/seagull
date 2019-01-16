import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'

import * as fs from 'fs'
import { skip, slow, suite, test } from 'mocha-typescript'
import { FS } from '../src'

@suite('Mocks::FS')
export class Test extends BasicTest {
  @test
  async 'cant be enabled and disabled'() {
    const mock = new FS('/tmp')
    expect(() => {
      mock.activate()
    }).throws(
      'Not implemented, well no efficent way to build it in a good way.'
    )
    expect(() => {
      mock.deactivate()
    }).throws(
      'Not implemented, well no efficent way to build it in a good way.'
    )
  }
  @test
  async 'can be resetted'() {
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    const mock = new FS('/tmp')
    mock.fs.writeFileSync('/tmp/stuff.txt', '') // , 'utf-8')
    mock.fs.existsSync('/tmp/stuff.txt').should.be.equal(true)
    mock.reset()
    mock.fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
  }
}

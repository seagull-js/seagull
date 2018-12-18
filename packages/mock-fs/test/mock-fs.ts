import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test } from 'mocha-typescript'
import { FS } from '../src'

@suite('Mocks::FS')
export class Test extends BasicTest {
  @test
  async 'can be enabled and disabled'() {
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    const mock = new FS('/tmp')
    mock.activate()
    fs.writeFileSync('/tmp/stuff.txt', '', 'utf-8')
    fs.existsSync('/tmp/stuff.txt').should.be.equal(true)
    mock.deactivate()
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
  }
  @test
  async 'can be resetted'() {
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    const mock = new FS('/tmp')
    mock.activate()
    fs.writeFileSync('/tmp/stuff.txt', '', 'utf-8')
    fs.existsSync('/tmp/stuff.txt').should.be.equal(true)
    mock.reset()
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    mock.deactivate()
  }
  @test
  @skip
  async 'decativate preserves internal state'() {
    fs.existsSync('/tmp/stuff.txt').should.be.equal(false)
    const mock = new FS('/tmp')
    mock.activate()
    fs.writeFileSync('/tmp/stuff.txt', '', 'utf-8')
    fs.existsSync('/tmp/stuff.txt').should.be.equal(true)
    mock.deactivate()
    mock.activate()
    fs.existsSync('/tmp/stuff.txt').should.be.equal(true)
  }
}

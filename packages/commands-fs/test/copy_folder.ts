import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::CopyFolder')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'does execute'() {
    fs.mkdirSync('/tmp/a')
    fs.writeFileSync('/tmp/a/index.html', '', 'utf-8')
    fs.mkdirSync('/tmp/a/a')
    fs.writeFileSync('/tmp/a/a/index.html', '', 'utf-8')
    const cmd = new FS.CopyFolder('/tmp/a', '/tmp/b')
    await cmd.execute()
    fs.existsSync('/tmp/b/index.html').should.be.equal(true)
    fs.existsSync('/tmp/b/a/index.html').should.be.equal(true)
  }
}

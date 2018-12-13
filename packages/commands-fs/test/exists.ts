import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::Exists')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'does return false if no file is found'() {
    const exists = await new FS.Exists('/tmp/index.html').execute()
    exists.should.be.equal(false)
  }

  @test
  async 'does return true if a file is found'() {
    fs.writeFileSync('/tmp/index.html', '', 'utf-8')
    const exists = await new FS.Exists('/tmp/index.html').execute()
    exists.should.be.equal(true)
  }

  @test
  async 'does return true if a folder is found'() {
    fs.mkdirSync('/tmp/folder')
    const exists = await new FS.Exists('/tmp/folder').execute()
    exists.should.be.equal(true)
  }

  @test
  async 'revert method should be a no-op'() {
    const cmd = new FS.Exists('/tmp/index.html')
    await cmd.execute()
    const result = await cmd.revert()
    result.should.be.equal(true)
  }
}

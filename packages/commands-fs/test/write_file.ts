import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::WriteFile')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can be executed and reverted'() {
    const content = '<html />'
    const writer = new FS.WriteFile('/tmp/index.html', content)
    await writer.execute()
    fs.existsSync('/tmp/index.html').should.be.equal(true)
    await writer.revert()
    fs.existsSync('/tmp/index.html').should.be.equal(false)
  }
}

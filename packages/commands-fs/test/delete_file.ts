import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::DeleteFile')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'does throw if no file source file is found'() {
    const response: any = { error: null }
    try {
      await new FS.DeleteFile('/tmp/index.html').execute()
    } catch (error) {
      response.error = error
    }
    response.error.should.not.be.equal(null)
  }

  @test
  async 'does execute and revert'() {
    const content = '<html />'
    fs.writeFileSync('/tmp/index.html', content, 'utf-8')
    const cmd = new FS.DeleteFile('/tmp/index.html')
    await cmd.execute()
    fs.existsSync('/tmp/index.html').should.be.equal(false)
    await cmd.revert()
    fs.existsSync('/tmp/index.html').should.be.equal(true)
    fs.readFileSync('/tmp/index.html', 'utf-8').should.be.equal(content)
  }
}

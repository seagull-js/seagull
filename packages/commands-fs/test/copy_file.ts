import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::CopyFile')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'does throw if no file source file is found'() {
    const response: any = { error: null }
    try {
      await new FS.CopyFile('/tmp/index.html', '/tmp/index.txt').execute()
    } catch (error) {
      response.error = error
    }
    response.error.should.not.be.equal(null)
  }

  @test
  async 'does execute and revert'() {
    const content = '<html />'
    fs.writeFileSync('/tmp/index.html', content, 'utf-8')
    fs.existsSync('/tmp/about.html').should.be.equal(false)
    const cmd = new FS.CopyFile('/tmp/index.html', '/tmp/about.html')
    await cmd.execute()
    fs.existsSync('/tmp/about.html').should.be.equal(true)
    const copiedContent = fs.readFileSync('/tmp/about.html', 'utf-8')
    copiedContent.should.be.equal(content)
    await cmd.revert()
    fs.existsSync('/tmp/about.html').should.be.equal(false)
  }
}

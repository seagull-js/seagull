import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'

const fs = FSSandbox.fs

@suite('FS::CopyFile')
export class Test extends BasicTest {
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
    fs.writeFileSync('/tmp/index.html', content)
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

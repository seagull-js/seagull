import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::DeleteFile')
export class Test extends BasicTest {
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
    fs.writeFileSync('/tmp/index.html', content)
    const cmd = new FS.DeleteFile('/tmp/index.html')
    await cmd.execute()
    fs.existsSync('/tmp/index.html').should.be.equal(false)
    await cmd.revert()
    fs.existsSync('/tmp/index.html').should.be.equal(true)
    fs.readFileSync('/tmp/index.html', 'utf-8').should.be.equal(content)
  }
}

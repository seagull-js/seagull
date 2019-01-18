import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::WriteFile')
export class Test extends BasicTest {
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

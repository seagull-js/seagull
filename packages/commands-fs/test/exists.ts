import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::Exists')
export class Test extends BasicTest {
  @test
  async 'does return false if no file is found'() {
    const exists = await new FS.Exists('/tmp/index.html').execute()
    exists.should.be.equal(false)
  }

  @test
  async 'does return true if a file is found'() {
    fs.writeFileSync('/tmp/index.html', '')
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

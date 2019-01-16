import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::DeleteFolder')
export class Test extends BasicTest {
  @test
  async 'does execute'() {
    fs.mkdirSync('/tmp/dir')
    fs.writeFileSync('/tmp/dir/index.html', '')
    fs.mkdirSync('/tmp/dir/dir')
    fs.writeFileSync('/tmp/dir/dir/index.html', '')
    const cmd = new FS.DeleteFolder('/tmp/dir')
    await cmd.execute()
    const list = await new FS.ListFiles('/tmp').execute()
    list.should.be.deep.equal([])
  }

  @test
  async 'revert method is currently a no-op'() {
    fs.mkdirSync('/tmp/dir')
    const cmd = new FS.DeleteFolder('/tmp/dir')
    await cmd.execute()
    const result = await cmd.revert()
    result.should.be.equal(true)
  }
}

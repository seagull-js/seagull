import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'

const fs = FSSandbox.fs

@suite('FS::CopyFolder')
export class Test extends BasicTest {
  @test
  async 'does execute'() {
    fs.mkdirSync('/tmp/a')
    fs.writeFileSync('/tmp/a/index.html', '')
    fs.mkdirSync('/tmp/a/a')
    fs.writeFileSync('/tmp/a/a/index.html', '')
    const cmd = new FS.CopyFolder('/tmp/a', '/tmp/b')
    await cmd.execute()
    fs.existsSync('/tmp/b/index.html').should.be.equal(true)
    fs.existsSync('/tmp/b/a/index.html').should.be.equal(true)
  }
}

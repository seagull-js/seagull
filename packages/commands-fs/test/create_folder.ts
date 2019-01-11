import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::CreateFolder')
export class Test extends BasicTest {
  @test
  async 'can be executed'() {
    fs.existsSync('/tmp/dir').should.be.equal(false)
    await new FS.CreateFolder('/tmp/dir').execute()
    fs.existsSync('/tmp/dir').should.be.equal(true)
  }
  @test
  async 'does not crash on pre existing folder'() {
    fs.existsSync('/tmp/dir').should.be.equal(false)
    await new FS.CreateFolder('/tmp/dir').execute()
    await new FS.CreateFolder('/tmp/dir').execute()
    fs.existsSync('/tmp/dir').should.be.equal(true)
  }
}

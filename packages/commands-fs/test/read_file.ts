import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::ReadFile')
export class Test extends BasicTest {
  @test
  async 'returns empty string (falsy) if target does not exist'() {
    const file = await new FS.ReadFile('/tmp/index.html').execute()
    file.should.be.equal('')
  }

  async 'does return string if target file is found'() {
    fs.writeFileSync('/tmp/index.html', 'lorem ipsum')
    const content = await new FS.ReadFile('/tmp/index.html').execute()
    content.should.be.equal('lorem ipsum')
  }

  @test
  async 'revert method should be a no-op'() {
    const cmd = new FS.ReadFile('/tmp/index.html')
    await cmd.execute()
    const result = await cmd.revert()
    result.should.be.equal(true)
  }
}

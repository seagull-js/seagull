import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FS } from '../src'
import { FSSandbox } from '../src/fs_sandbox'
const fs = FSSandbox.fs

@suite('FS::ListFiles')
export class Test extends BasicTest {
  @test
  async 'does return empty array if no target folder is found'() {
    const list = await new FS.ListFiles('/tmp/unknwon').execute()
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'does return empty array if target folder is empty'() {
    const list = await new FS.ListFiles('/tmp').execute()
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'does return empty array if target folder is not found'() {
    const list = await new FS.ListFiles('/tmp/non-existent').execute()
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'does return array with one element if no target is a file'() {
    fs.writeFileSync('/tmp/index.html', '')
    const list = await new FS.ListFiles('/tmp/index.html').execute()
    list.should.be.an('array')
    list.length.should.be.equal(1)
    list.should.have.members(['/tmp/index.html'])
  }

  async 'does return file array if target folder is found'() {
    fs.writeFileSync('/tmp/index.html', '')
    fs.mkdirSync('/tmp/a')
    fs.writeFileSync('/tmp/a/index.html', '')
    const list = await new FS.ListFiles('/tmp').execute()
    list.should.be.an('array')
    list.should.have.members(['/tmp/index.html', '/tmp/a/index.html'])
  }

  async 'can apply filter pattern to result list optionally'() {
    fs.writeFileSync('/tmp/index.html', '')
    fs.writeFileSync('/tmp/index.js', '')
    const list = await new FS.ListFiles('/tmp', /html$/).execute()
    list.should.be.an('array')
    list.should.have.members(['/tmp/index.html'])
  }

  @test
  async 'revert method should be a no-op'() {
    const cmd = new FS.ListFiles('/tmp')
    await cmd.execute()
    const result = await cmd.revert()
    result.should.be.equal(true)
  }
}

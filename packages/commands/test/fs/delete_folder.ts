import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../../src'

@suite('FS::DeleteFolder')
export class Test extends BasicTest {
  mocks = [new this.mock.FS('/tmp')]

  @test
  async 'does execute'() {
    fs.mkdirSync('/tmp/dir')
    fs.writeFileSync('/tmp/dir/index.html', '', 'utf-8')
    fs.mkdirSync('/tmp/dir/dir')
    fs.writeFileSync('/tmp/dir/dir/index.html', '', 'utf-8')
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

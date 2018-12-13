import { FS } from '@seagull/commands-fs'
import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Bundle } from '../../src'

@suite('Bundle::Vendor')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can transform npm packages file into bundle file'() {
    await new Bundle.Vendor([], '/tmp/b.js').execute()
    const result = await new FS.ReadFile('/tmp/b.js').execute()
    result.should.be.a('string').that.is.not.equal('')
  }
}

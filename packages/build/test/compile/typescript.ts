import { FS } from '@seagull/commands-fs'
import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Compile } from '../../src'

@suite('Compile::Typescript')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can transform a js file into "Page" UMD bundle'() {
    await new FS.WriteFile('/tmp/a.js', 'export default {}').execute()
    await new Compile.Typescript('/tmp/a.js', '/tmp/b.js').execute()
    const result = await new FS.ReadFile('/tmp/b.js').execute()
    result.should.be.a('string').that.is.not.equal('')
  }
}

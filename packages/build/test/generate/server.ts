import { FS } from '@seagull/commands-fs'
import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Generate } from '../../src'

@suite('Generate::Server')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can write an server.js boilerplate file'() {
    await new Generate.Server('/tmp/app.js').execute()
    const result = await new FS.ReadFile('/tmp/app.js').execute()
    result.should.be.a('string').that.is.not.equal('')
  }
}

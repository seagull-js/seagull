import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../src'

@suite('FS::CreateFolder')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can be executed'() {
    fs.existsSync('/tmp/dir').should.be.equal(false)
    await new FS.CreateFolder('/tmp/dir').execute()
    fs.existsSync('/tmp/dir').should.be.equal(true)
  }
}

import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import { ReadLog, WriteLog } from '../src'

@suite('commands-logging::ReadLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'ReadLog returns empty array if logStream does not exist'() {
    const logs = await new ReadLog({
      logStreamName: 'doesNotExist',
    }).execute()

    logs.events!.should.be.an('array').and.lengthOf(0)
  }

  @test
  async 'revert method should be a no-op'() {
    const command = new ReadLog({
      logStreamName: 'readLog',
    })

    await command.execute()
    const result = await command.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

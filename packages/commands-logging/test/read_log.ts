import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { CloudWatchLogs } from '../src'

@suite('commands-logging::ReadLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'WriteLog and ReadLog work'() {
    const params = {
      logStreamName: 'readLog',
      logs: [
        { message: 'Foo' },
        { message: { a: 'A', b: 'B', c: 'C' } },
        { message: 1000, timestamp: 1550145764 },
      ],
    }
    await new CloudWatchLogs.WriteLog(params).execute()
    const logs = await new CloudWatchLogs.ReadLog({
      logStreamName: 'readLog',
    }).execute()

    logs.events!.should.be.an('array').and.lengthOf(3)
    for (const log of logs.events!) {
      log.message!.should.be.a('string').and.length.above(1)
    }
  }

  @test
  async 'ReadLog returns empty array if logStream does not exist'() {
    const logs = await new CloudWatchLogs.ReadLog({
      logStreamName: 'doesNotExist',
    }).execute()

    logs.events!.should.be.an('array').and.lengthOf(0)
  }

  @test
  async 'revert method should be a no-op'() {
    const command = new CloudWatchLogs.ReadLog({
      logStreamName: 'readLog',
    })

    await command.execute()
    const result = await command.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

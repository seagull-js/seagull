import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { CloudWatchLogs } from '../src'

@suite('commands-logging::WriteLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'revert method should be a no-op'() {
    const params = {
      logStreamName: 'readLog',
      logs: [
        { message: 'Foo' },
        { message: { a: 'A', b: 'B' } },
        { message: 1000, timestamp: 1550145764 },
      ],
    }
    const command = new CloudWatchLogs.WriteLog(params)

    await command.execute()
    const result = await command.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

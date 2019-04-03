import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import { AddLog, CreateStream, ReadLog } from '../src'

@suite('commands-logging::AddLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'can create log stream and add muliple logs'() {
    const log1 = [
      { bar: 'Foo' },
      'TEST TEST',
      [23, 'Hello World', null, { foo: 'bar' }],
    ]
    const log2 = ['FOO', 'BAR']
    const stream = await new CreateStream('addLogTest').execute()
    const command1 = new AddLog(stream, log1)
    await command1.execute()

    const command2 = new AddLog(stream, log2)
    await command2.execute()

    const returnedLogs = await new ReadLog({
      logStreamName: stream,
    }).execute()
    console.info('returnedLogs', returnedLogs)
    returnedLogs.events!.should.be.an('array').with.lengthOf(2)
    returnedLogs.events![0].message!.should.be.a('string')
    returnedLogs.events![0].timestamp!.should.be.a('number')
  }

  @test
  async 'revert method should be a no-op'() {
    const logs = [
      { bar: 'Foo' },
      'TEST TEST',
      [23, 'Hello World', null, { foo: 'bar' }],
    ]

    const command = new AddLog('readLog', logs, 'error')
    const result = await command.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

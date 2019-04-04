import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import { ReadLog, WriteLog } from '../src'

@suite('commands-logging::WriteLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'can write and read one log'() {
    const logs = [
      { bar: 'Foo' },
      'TEST TEST',
      [23, 'Hello World', null, { foo: 'bar' }],
    ]

    const command = new WriteLog({
      log: logs,
      logLevel: 'error',
      logStreamName: 'readLog',
    })

    await command.execute()

    const returnedLogs = await new ReadLog({
      logStreamName: command.params.logStreamName,
    }).execute()

    returnedLogs.events!.should.be.an('array').with.lengthOf(1)
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

    const command = new WriteLog({
      log: logs,
      logLevel: 'error',
      logStreamName: 'readLog',
    })
    const result = await command.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

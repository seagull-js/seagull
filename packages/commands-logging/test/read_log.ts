import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import { ReadLog, WriteLog, WriteLogs } from '../src'

@suite('commands-logging::ReadLog')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'can transform multiple logs to original'() {
    const logs = [
      { bar: 'Foo' },
      'TEST TEST',
      [23, 'Hello World', null, { foo: 'bar' }],
    ]

    const writeCommand = new WriteLogs('writeLogs', logs)
    await writeCommand.execute()

    const readCommand = new ReadLog({
      logStreamName: writeCommand.params.logStreamName,
    })
    await readCommand.execute()
    const original = readCommand.getOriginalLog()
    original.should.be.deep.equal(logs)
  }

  @test
  async 'can transform a single log to original'() {
    const log = 'Hello World'

    const writeCommand = new WriteLog('writeLog', log)
    await writeCommand.execute()

    const readCommand = new ReadLog({
      logStreamName: writeCommand.params.logStreamName,
    })
    await readCommand.execute()
    const original = readCommand.getOriginalLog()
    original.should.be.equals(log)
  }

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

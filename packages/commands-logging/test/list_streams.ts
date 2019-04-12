import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import { AddLog, CreateStream, ListStreams, ReadLog } from '../src'

@suite('commands-logging::ListStreams')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'can list all streams'() {
    const log = [
      { bar: 'Foo' },
      'TEST TEST',
      [23, 'Hello World', null, { foo: 'bar' }],
    ]
    const stream = await new CreateStream({
      logStreamName: 'stream_1',
    }).execute()
    await new AddLog({ log, logStreamName: stream }).execute()

    const stream2 = await new CreateStream({
      logStreamName: 'stream_2',
    }).execute()
    await new AddLog({ log, logStreamName: stream2 }).execute()

    const otherStream = await new CreateStream({
      logStreamName: 'otherStream',
    }).execute()
    await new AddLog({ log, logStreamName: otherStream }).execute()

    const streams = await new ListStreams({
      logStreamNamePrefix: 'stream_',
    }).execute()

    streams.logStreams!.should.be.an('array').with.lengthOf(2)
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

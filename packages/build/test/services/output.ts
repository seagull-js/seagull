import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as stream from 'stream-buffers'
import * as Services from '../../src/services'
import { ServiceEventBus } from '../../src/services'

@suite('Services::Output')
export class Test extends BasicTest {
  @test
  async 'emitting log renders message to stdout'() {
    const stdout = new stream.WritableStreamBuffer() as any

    const eb = new ServiceEventBus<Services.OutputServiceEvents>()
    const output = new Services.OutputService(eb, { stdout })
    eb.emit(Services.LogEvent, 'Test', 'tester', {}) // , 'hey my name is!')

    const stdoutContent = stdout.getContentsAsString('utf8')
    stdoutContent.should.contain('Test')
    stdoutContent.should.contain('{}')
  }
}

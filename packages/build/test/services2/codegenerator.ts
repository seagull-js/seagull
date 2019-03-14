import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as Services from '../../src/services2'
import { ServiceEventBus } from '../../src/services2'

@suite('Services::CodeGeneration')
export class Test extends BasicTest {
  @test
  async 'sending prepare emits prepared and log'() {
    const eb = new ServiceEventBus<Services.CodeGeneratorServiceEvents>()
    const output = new Services.CodeGeneratorService(eb)

    const generated = eb.promisifyEmitOnce(Services.GeneratedCodeEvent)
    eb.emit(Services.GenerateCodeEvent)
    await Promise.all([generated])
  }
}

import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as Services from '../../src/services'
import { ServiceEventBus } from '../../src/services'

@suite('Services::Compiler')
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

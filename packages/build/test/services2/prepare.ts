import { FS } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as Services from '../../src/services2'
import { ServiceEventBus } from '../../src/services2'

@suite('Services::Prepare')
export class Test extends BasicTest {
  @test
  async 'sending prepare emits prepared and log'() {
    const fs = new FS('/tmp').fs

    const eb = new ServiceEventBus<Services.PrepareServiceEvents>()
    const config = { appFolder: '/tmp' }
    const output = new Services.PrepareService(eb, config, fs as any)

    const preparedPromise = eb.promisifyEmitOnce(Services.PreparedEvent)
    const logPromise = eb.promisifyEmitOnce(
      Services.LogEvent,
      (service, event, data) => {
        service.should.be.eq('PrepareService')
        event.should.be.eq('prepared')
        data.time.length.should.be.eq(2)
      }
    )
    eb.emit(Services.PrepareEvent)
    await Promise.all([preparedPromise, logPromise])
  }

  @test
  async 'without release works'() {
    const fs = new FS('/tmp').fs
    fs.mkdirSync('/tmp/assets')
    fs.mkdirSync('/tmp/static')
    fs.writeFileSync('/tmp/static/index.html', '')

    const eb = new ServiceEventBus<Services.PrepareServiceEvents>()
    const config = { appFolder: '/tmp' }
    const output = new Services.PrepareService(eb, config, fs as any)

    const preparedPromise = eb.promisifyEmitOnce(Services.PreparedEvent)
    eb.emit(Services.PrepareEvent)
    await preparedPromise
    // tslint:disable-next-line:no-unused-expression
    fs.existsSync('/tmp/dist/assets/pages').should.be.true
    // tslint:disable-next-line:no-unused-expression
    fs.existsSync('/tmp/dist/assets/static/index.html').should.be.false
  }

  @test
  async 'with release works'() {
    const fs = new FS('/tmp').fs
    fs.mkdirSync('/tmp/assets')
    fs.mkdirSync('/tmp/static')
    fs.writeFileSync('/tmp/static/index.html', '')

    const eb = new ServiceEventBus<Services.PrepareServiceEvents>()
    const config = { appFolder: '/tmp', release: true }
    const output = new Services.PrepareService(eb, config, fs as any)

    const preparedPromise = eb.promisifyEmitOnce(Services.PreparedEvent)
    eb.emit(Services.PrepareEvent)
    await preparedPromise
    // tslint:disable-next-line:no-unused-expression
    fs.existsSync('/tmp/dist/assets/pages').should.be.true
    // tslint:disable-next-line:no-unused-expression
    fs.existsSync('/tmp/dist/assets/static/index.html').should.be.true
  }
}

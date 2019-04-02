// tslint:disable:no-unused-expression
import { FS } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as Services from '../../src/services'
import { ServiceEventBus } from '../../src/services'

@suite('Services::CodeGeneration')
export class Test extends BasicTest {
  @test
  async 'sending generate emits generated and log'() {
    const fs = new FS('/tmp/dist').fs
    const config = { appFolder: '/tmp' }

    const eb = new ServiceEventBus<Services.CodeGeneratorServiceEvents>()
    const output = new Services.CodeGeneratorService(eb, config, fs as any)

    const generated = eb.promisifyEmitOnce(Services.GeneratedCodeEvent)
    const logPromise = eb.promisifyEmitOnce(
      Services.LogEvent,
      (service, event, data) => {
        service.should.be.eq('CodeGeneratorService')
        event.should.be.eq('generated')
        data.time.length.should.be.eq(2)
      }
    )
    eb.emit(Services.GenerateCodeEvent)
    await Promise.all([generated, logPromise])
  }

  @test
  async 'non release generates runner'() {
    const fs = new FS('/tmp/dist').fs
    const config = { appFolder: '/tmp' }

    const eb = new ServiceEventBus<Services.CodeGeneratorServiceEvents>()
    const output = new Services.CodeGeneratorService(eb, config, fs as any)

    const generated = eb.promisifyEmitOnce(Services.GeneratedCodeEvent)
    eb.emit(Services.GenerateCodeEvent)
    await generated

    fs.existsSync('/tmp/dist/runner.js').should.be.true
  }

  @test
  async 'release generates app server and lambda'() {
    const fs = new FS('/tmp/dist').fs
    const config = { appFolder: '/tmp', release: true }

    const eb = new ServiceEventBus<Services.CodeGeneratorServiceEvents>()
    const output = new Services.CodeGeneratorService(eb, config, fs as any)

    const generated = eb.promisifyEmitOnce(Services.GeneratedCodeEvent)
    eb.emit(Services.GenerateCodeEvent)
    await generated

    fs.existsSync('/tmp/dist/app.js').should.be.true
    fs.existsSync('/tmp/dist/server.js').should.be.true
    fs.existsSync('/tmp/dist/lambda.js').should.be.true

    const lContent = 'module.exports.handler'
    fs.readFileSync('/tmp/dist/lambda.js', 'utf-8').should.contain(lContent)
    const eContent = 'registerRoute'
    fs.readFileSync('/tmp/dist/app.js', 'utf-8').should.contain(eContent)
  }
}

import { Mode, SetMode } from '@seagull/mode'
import { config } from '@seagull/seed'
import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { Container } from 'inversify'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { SoapClientSupplier } from '../src/mode/cloud'
import { SoapClientSupplierPure } from '../src/mode/pure'
import { SoapClientSupplierSeed } from '../src/mode/seed'
import { module } from '../src/module'

@suite('Soap::Module')
export class Test extends BasicTest {
  static injector = new Container()
  static before() {
    this.injector.load(module)
  }

  @test
  async 'can create cloud instance'() {
    const setMode = new SetMode('environment', 'cloud')
    await setMode.execute()
    expect(Mode.environment).to.be.eq('cloud')
    const http = Test.injector.get(SoapClientSupplier)
    expect(http instanceof SoapClientSupplier).to.equal(true)
  }

  @test
  async 'can create connected instance'() {
    const setMode = new SetMode('environment', 'connected')
    await setMode.execute()
    expect(Mode.environment).to.be.eq('connected')
    const http = Test.injector.get(SoapClientSupplier)
    expect(http instanceof SoapClientSupplier).to.equal(true)
  }

  @test
  async 'can create edge instance'() {
    const setMode = new SetMode('environment', 'edge')
    await setMode.execute()
    expect(Mode.environment).to.be.eq('edge')
    const http = Test.injector.get(SoapClientSupplier)
    expect(http instanceof SoapClientSupplier).to.equal(true)
  }

  @test
  async 'can create pure instance'() {
    const setMode = new SetMode('environment', 'pure')
    await setMode.execute()
    expect(Mode.environment).to.be.eq('pure')
    const http = Test.injector.get(SoapClientSupplier)
    expect(http instanceof SoapClientSupplierPure).to.equal(true)
  }

  @test
  async 'can create seed instance'() {
    const setMode = new SetMode('environment', 'pure')
    await setMode.execute()
    config.seed = true
    expect(Mode.environment).to.be.eq('pure')
    const http = Test.injector.get(SoapClientSupplier)
    expect(http instanceof SoapClientSupplierSeed).to.equal(true)
    config.seed = false
  }
}

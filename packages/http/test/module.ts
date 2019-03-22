import { Mode, SetMode } from '@seagull/mode'
import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { Container } from 'inversify'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { config } from '../src/config'
import { Http } from '../src/modes/cloud'
import { HttpPure } from '../src/modes/pure'
import { HttpSeed } from '../src/modes/seed'
import { module } from '../src/module'

@suite('Http::Module::Fetch')
export class Test extends BasicTest {
  static injector = new Container()
  static before() {
    this.injector.load(module)
  }

  @test
  async 'can create cloud instance'() {
    const setPureMode = new SetMode('environment', 'cloud')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('cloud')
    const http = Test.injector.get(Http)
    expect(http instanceof Http).to.equal(true)
  }

  @test
  async 'can create connected instance'() {
    const setPureMode = new SetMode('environment', 'connected')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('connected')
    const http = Test.injector.get(Http)
    expect(http instanceof Http).to.equal(true)
  }

  @test
  async 'can create edge instance'() {
    const setPureMode = new SetMode('environment', 'edge')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('edge')
    const http = Test.injector.get(Http)
    expect(http instanceof Http).to.equal(true)
  }

  @test
  async 'can create pure instance'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('pure')
    const http = Test.injector.get(Http)
    expect(http instanceof HttpPure).to.equal(true)
  }

  @test
  async 'can create seed instance'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    config.seed = true
    expect(Mode.environment).to.be.eq('pure')
    const http = Test.injector.get(Http)
    expect(http instanceof HttpSeed).to.equal(true)
    config.seed = false
  }
}

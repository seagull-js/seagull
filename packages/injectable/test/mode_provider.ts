import { Mode, SetMode } from '@seagull/mode'
import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import { Injectable } from 'injection-js'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import 'reflect-metadata'
import { createModeProvider } from '../src'

class CloudSomething {}
class ConnectedSomething {}
class EdgeSomething {}
class PureSomething {}

const modeProviders = {
  cloud: CloudSomething,
  connected: ConnectedSomething,
  edge: EdgeSomething,
  pure: PureSomething,
}

@suite('Injectable')
export class Test extends BasicTest {
  @test
  async 'can create cloud provider'() {
    const setPureMode = new SetMode('environment', 'cloud')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('cloud')
    const provider = createModeProvider(modeProviders)
    expect(provider.useClass).to.equal(CloudSomething)
  }

  @test
  async 'can create connected provider'() {
    const setPureMode = new SetMode('environment', 'connected')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('connected')
    const provider = createModeProvider(modeProviders)
    expect(provider.useClass).to.equal(ConnectedSomething)
  }

  @test
  async 'can create edge provider'() {
    const setPureMode = new SetMode('environment', 'edge')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('edge')
    const provider = createModeProvider(modeProviders)
    expect(provider.useClass).to.equal(EdgeSomething)
  }

  @test
  async 'can create pure provider'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('pure')
    const provider = createModeProvider(modeProviders)
    expect(provider.useClass).to.equal(PureSomething)
  }
}

import { Mode, SetMode } from '@seagull/mode'
import { config } from '@seagull/seed'
import { ServiceTest } from '@seagull/testing'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3, s3ServicesModule } from '../src'
import { S3Edge } from '../src/mode/edge'
import { S3Pure } from '../src/mode/pure'
import { S3Seed } from '../src/mode/seed'

@suite('S3::Module')
export class Test extends ServiceTest {
  serviceModules = [s3ServicesModule]
  services = []

  @test
  async 'can create cloud instance'() {
    const setPureMode = new SetMode('environment', 'cloud')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('cloud')
    const s3 = this.injector.get(S3)
    expect(s3 instanceof S3).to.equal(true)
  }

  @test
  async 'can create connected instance'() {
    const setPureMode = new SetMode('environment', 'connected')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('connected')
    const s3 = this.injector.get(S3)
    expect(s3 instanceof S3).to.equal(true)
  }

  @test
  async 'can create edge instance'() {
    const setPureMode = new SetMode('environment', 'edge')
    await setPureMode.execute()
    expect(Mode.environment).to.be.eq('edge')
    const s3 = this.injector.get(S3)
    expect(s3 instanceof S3Edge).to.equal(true)
  }

  @test
  async 'can create pure instance'() {
    const s3 = this.injector.get(S3)
    expect(s3 instanceof S3Pure).to.equal(true)
  }

  @test
  async 'can create seed instance'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    config.seed = true
    expect(Mode.environment).to.be.eq('pure')
    const s3 = this.injector.get(S3)
    expect(s3 instanceof S3Seed).to.equal(true)
    config.seed = false
  }
}

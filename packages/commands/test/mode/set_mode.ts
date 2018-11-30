import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { SetMode } from '../../src'
import { Mode } from '../../src/mode/definition'

@suite('Mode::SetMode')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'there is a mode singleton'() {
    // tslint:disable-next-line:no-unused-expression
    Mode.environment.should.not.be.undefined
    Mode.environment.should.not.be.equal(null)
    const response: any = { error: null }
  }

  @test
  async 'can set mode'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    Mode.environment.should.be.eq('pure')
    const setCloudMode = new SetMode('environment', 'cloud')
    await setCloudMode.execute()
    Mode.environment.should.be.eq('cloud')
    await setPureMode.revert()
  }

  @test
  async 'can revert mode'() {
    const setPureMode = new SetMode('environment', 'pure')
    await setPureMode.execute()
    Mode.environment.should.be.eq('pure')
    const setCloudMode = new SetMode('environment', 'cloud')
    await setCloudMode.execute()
    Mode.environment.should.be.eq('cloud')
    await setCloudMode.revert()
    Mode.environment.should.be.eq('pure')
    await setPureMode.revert()
  }
}

import { Mode, SetMode } from '@seagull/mode'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Mode::SetMode')
export class Test {
  mocks = []

  @test
  async 'requiring set_pure sets mode environment to pure'() {
    Mode.environment.should.be.eq('edge')
    require('../src/setup')
    Mode.environment.should.be.eq('pure')

    // reset
    await new SetMode('environment', 'edge').execute()
  }
}

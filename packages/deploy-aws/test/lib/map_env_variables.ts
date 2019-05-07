import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'

import { suite, test } from 'mocha-typescript'
import { mapEnvironmentVariables } from '../../src'

@suite('AddEnvFromFile')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }

  @test
  async 'can get env variables from valid file'() {
    const variables = {
      ANY_THING_: '1234567',
      STAGE: 'prod',
      TEST: 'abcde',
    }
    const result = mapEnvironmentVariables(variables)
    expect(result).to.be.an('object')
    expect(result.ANY_THING_.value).to.be.equals(variables.ANY_THING_)
    expect(result.STAGE.value).to.be.equals(variables.STAGE)
    expect(result.TEST.value).to.be.equals(variables.TEST)
  }
}

import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'

import { suite, test } from 'mocha-typescript'
import { addEnvFromFile } from '../../src'

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
    const env = { A: '123', BC: 5 }
    const config = `ABC=456`
    const newEnv = addEnvFromFile(env, config)
    expect(newEnv.A).to.be.equals('123')
    expect(newEnv.BC).to.be.equals(5)
    expect(newEnv.ABC).to.be.equals('456')
  }

  @test
  async 'can get env variables from valid file with multiple lines'() {
    const env = { A: '123', BC: 5 }
    const config = `ABC=456
DEF=999`
    const newEnv = addEnvFromFile(env, config)
    expect(newEnv.A).to.be.equals('123')
    expect(newEnv.BC).to.be.equals(5)
    expect(newEnv.ABC).to.be.equals('456')
    expect(newEnv.DEF).to.be.equals('999')
  }

  @test
  async 'can get env variables from valid file with multiple and empty lines'() {
    const env = { A: '123', BC: 5 }
    const config = `ABC=456

DEF=999`
    const newEnv = addEnvFromFile(env, config)
    expect(newEnv.A).to.be.equals('123')
    expect(newEnv.BC).to.be.equals(5)
    expect(newEnv.ABC).to.be.equals('456')
    expect(newEnv.DEF).to.be.equals('999')
  }

  @test
  async 'can get env variables from valid file with invalid lines'() {
    const env = { A: '123', BC: 5 }
    const config = `ABC=

DEF=999
=1111`
    const newEnv = addEnvFromFile(env, config)
    expect(newEnv.A).to.be.equals('123')
    expect(newEnv.BC).to.be.equals(5)
    expect(newEnv.ABC).to.be.equals(undefined)
    expect(newEnv.DEF).to.be.equals('999')
  }

  @test
  async 'can get env variables from valid file line with multiple ='() {
    const env = { A: '123', BC: 5 }
    const config = `ABC=

DEF=999=2223
=1111`
    const newEnv = addEnvFromFile(env, config)
    expect(newEnv.A).to.be.equals('123')
    expect(newEnv.BC).to.be.equals(5)
    expect(newEnv.ABC).to.be.equals(undefined)
    expect(newEnv.DEF).to.be.equals('999=2223')
  }
}

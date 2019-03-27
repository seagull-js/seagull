import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { handleSSMSecret, SSMHandler } from '../src/aws_sdk_handler/handle_ssm'

@suite('HandleSSMSecret')
export class Test extends BasicTest {
  envSharedCreds?: string

  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }

  @test
  async 'can set a SSMSecret via new token'() {
    const ssmHandler = new TestSSMHandler()
    const params = { ssmHandler, token: '123', tokenName: 'testToken' }
    const ssmSecret = await handleSSMSecret(params)
    expect(ssmSecret.name).to.be.equals('testToken')
    expect(ssmSecret.secret.resolve()).to.be.equals('123')
  }

  async 'can set a SSMSecret via existing token'() {
    const handler = new TestSSMHandler({ testToken: 'abc' })
    const params = { ssmHandler: handler, tokenName: 'testToken' }
    const ssmSecret = await handleSSMSecret(params)
    expect(ssmSecret.name).to.be.equals('testToken')
    expect(ssmSecret.secret.resolve()).to.be.equals('abc')
  }

  @test
  async 'can set a SSMSecret and overwrite an existing one'() {
    const ssmHandler = new TestSSMHandler({ testToken: 'abc' })
    const params = { ssmHandler, token: '123', tokenName: 'testToken' }
    const ssmSecret = await handleSSMSecret(params)
    expect(ssmSecret.name).to.be.equals('testToken')
    expect(ssmSecret.secret.resolve()).to.be.equals('123')
  }

  @test
  async 'get an invalid SSMSecret, if no same is given'() {
    const ssmHandler = new TestSSMHandler()
    const params = { ssmHandler }
    const ssmSecret = await handleSSMSecret(params)
    expect(ssmSecret.name).to.be.equals('noToken')
    expect(ssmSecret.secret.resolve()).to.be.equals('')
  }
}

class TestSSMHandler extends SSMHandler {
  private mockStore: { [key: string]: string }

  constructor(testData?: { [key: string]: string }) {
    super()
    this.mockStore = testData || {}
  }

  async getParameter(ssmName: string) {
    return this.mockStore[ssmName] || ''
  }

  async createParameter(name: string, value: string) {
    this.mockStore[name] = value
    return
  }
}

import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { config, Credentials, SharedIniFileCredentials } from 'aws-sdk'

import { setCredsByProfile } from '../src'

@suite('SetAwsCredentials')
export class Test extends BasicTest {
  envSharedCreds?: string

  async before() {
    await BasicTest.prototype.before.bind(this)()
    this.envSharedCreds = process.env.AWS_SHARED_CREDENTIALS_FILE
    process.env.AWS_SHARED_CREDENTIALS_FILE = './test_data/credentials'
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
    process.env.AWS_SHARED_CREDENTIALS_FILE = this.envSharedCreds
  }
  @test
  async 'can set the profile'() {
    const options = {
      filename: process.env.AWS_SHARED_CREDENTIALS_FILE,
      profile: 'default',
    }
    config.credentials = new SharedIniFileCredentials(options)
    config.credentials.accessKeyId.should.be.equals('12345678')
    config.credentials.secretAccessKey.should.be.equals('98765453421')
    setCredsByProfile('test-user')
    config.credentials.accessKeyId.should.be.equals('abcdefg')
    config.credentials.secretAccessKey.should.be.equals('klmnopq')
    setCredsByProfile('default')
    config.credentials.accessKeyId.should.be.equals('12345678')
    config.credentials.secretAccessKey.should.be.equals('98765453421')
  }

  @test
  async 'cannot set invalid profile'() {
    const options = {
      filename: process.env.AWS_SHARED_CREDENTIALS_FILE,
      profile: 'default',
    }
    config.credentials = new SharedIniFileCredentials(options)
    config.credentials.accessKeyId.should.be.equals('12345678')
    config.credentials.secretAccessKey.should.be.equals('98765453421')
    setCredsByProfile('invalid-profile')
    config.credentials.accessKeyId.should.be.equals('12345678')
    config.credentials.secretAccessKey.should.be.equals('98765453421')
  }
}

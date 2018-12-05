import 'chai/register-should'
import { skip, suite, test } from 'mocha-typescript'
import * as mock from 'mock-require'

class MockSharedIniFileCredentials {
  /**
   * AWS access key ID.
   */
  accessKeyId?: string
  /**
   * AWS secret access key.
   */
  secretAccessKey?: string
  /**
   * AWS session token.
   */
  sessionToken?: string
  constructor(input: any) {
    const profile = input.profile
    if (profile === 'valid_profile') {
      this.accessKeyId = 'validAccessKey'
      this.secretAccessKey = 'validSecretAccessKey'
      this.sessionToken = 'validSessionToken'
    }
    if (profile === 'valid_profile_env') {
      this.accessKeyId = 'validAccessKeyEnv'
      this.secretAccessKey = 'validSecretAccessKeyEnv'
      this.sessionToken = 'validSessionTokenEnv'
    }
  }
}

mock('aws-sdk', {
  SharedIniFileCredentials: MockSharedIniFileCredentials,
  config: {
    credentials: null,
  },
})

import * as aws from 'aws-sdk'

import { ProfileCheck } from '../../src/commands/check_profile'

@suite('Commands')
export class Test {
  before() {
    delete process.env.AWS_PROFILE
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY
    aws.config.credentials = null
  }

  @test
  async 'test with a valid profile and no config in env'() {
    const profileCheck = new ProfileCheck('valid_profile')
    const profileCheckResult = profileCheck.execute()
    const envProfileIsSet = process.env.AWS_PROFILE === 'valid_profile'
    const creds: any = aws.config.credentials || {}
    profileCheckResult.should.be.equals(true)
    envProfileIsSet.should.be.equals(true)
    creds.accessKeyId.should.be.equal('validAccessKey')
    creds.secretAccessKey.should.be.equal('validSecretAccessKey')
    creds.sessionToken.should.be.equal('validSessionToken')
  }

  @test
  async 'test with an invalid profile and no config in env'() {
    const profileCheck = new ProfileCheck('invalid_profile')
    const profileCheckResult = profileCheck.execute()
    profileCheckResult.should.be.equals(false)
    const envProfile = process.env.AWS_PROFILE === undefined
    envProfile.should.be.equals(true)
  }

  @test
  async 'test with no profile and no config in env'() {
    const profileCheck = new ProfileCheck()
    const profileCheckResult = profileCheck.execute()
    profileCheckResult.should.be.equals(false)
    const envProfile = process.env.AWS_PROFILE === undefined
    envProfile.should.be.equals(true)
  }

  @test
  async 'test with no profile and profile config in env'() {
    process.env.AWS_PROFILE = 'valid_profile_env'
    const profileCheck = new ProfileCheck()
    const profileCheckResult = profileCheck.execute()
    profileCheckResult.should.be.equals(true)
    const envProfileIsSet = process.env.AWS_PROFILE === 'valid_profile_env'
    const creds: any = aws.config.credentials || {}
    profileCheckResult.should.be.equals(true)
    envProfileIsSet.should.be.equals(true)
    creds.accessKeyId.should.be.equal('validAccessKeyEnv')
    creds.secretAccessKey.should.be.equal('validSecretAccessKeyEnv')
    creds.sessionToken.should.be.equal('validSessionTokenEnv')
  }

  @test
  async 'test with invalid profile and profile config in env'() {
    process.env.AWS_PROFILE = 'valid_profile_env'
    const profileCheck = new ProfileCheck('invalid_profile')
    const profileCheckResult = profileCheck.execute()
    profileCheckResult.should.be.equals(true)
    const envProfileIsSet = process.env.AWS_PROFILE === 'valid_profile_env'
    const creds: any = aws.config.credentials || {}
    profileCheckResult.should.be.equals(true)
    envProfileIsSet.should.be.equals(true)
    creds.accessKeyId.should.be.equal('validAccessKeyEnv')
    creds.secretAccessKey.should.be.equal('validSecretAccessKeyEnv')
    creds.sessionToken.should.be.equal('validSessionTokenEnv')
  }

  @test
  async 'test with a valid profile and profile config in env'() {
    process.env.AWS_PROFILE = 'valid_profile_env'
    const profileCheck = new ProfileCheck('valid_profile')
    const profileCheckResult = profileCheck.execute()
    const envProfileIsSet = process.env.AWS_PROFILE === 'valid_profile'
    const creds: any = aws.config.credentials || {}
    profileCheckResult.should.be.equals(true)
    envProfileIsSet.should.be.equals(true)
    creds.accessKeyId.should.be.equal('validAccessKey')
    creds.secretAccessKey.should.be.equal('validSecretAccessKey')
    creds.sessionToken.should.be.equal('validSessionToken')
  }

  @test
  async 'test with no profile and key config in env'() {
    process.env.AWS_ACCESS_KEY_ID = 'validAccessKeyEnv'
    process.env.AWS_SECRET_ACCESS_KEY = 'validSecretAccessKeyEnv'
    const profileCheck = new ProfileCheck()
    const profileCheckResult = profileCheck.execute()
    const envProfileIsNotSet = process.env.AWS_PROFILE === undefined
    const credsIsNotChanged: any = aws.config.credentials === null
    profileCheckResult.should.be.equals(true)
    envProfileIsNotSet.should.be.equals(true)
    credsIsNotChanged.should.be.equals(true)
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''
    accessKeyId.should.be.equals('validAccessKeyEnv')
    secretAccessKey.should.be.equals('validSecretAccessKeyEnv')
  }

  @test
  async 'test with no profile and buggy key config in env'() {
    process.env.AWS_ACCESS_KEY_ID = 'validAccessKeyEnv'
    const profileCheck = new ProfileCheck()
    const profileCheckResult = profileCheck.execute()
    const envProfileIsNotSet = process.env.AWS_PROFILE === undefined
    const credsIsNotChanged: any = aws.config.credentials === null
    profileCheckResult.should.be.equals(false)
    envProfileIsNotSet.should.be.equals(true)
    credsIsNotChanged.should.be.equals(true)
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''
    accessKeyId.should.be.equals('validAccessKeyEnv')
    secretAccessKey.should.be.not.equals('validSecretAccessKeyEnv')
  }

  @test
  async 'test with a profile and profile in env, then revert'() {
    process.env.AWS_PROFILE = 'valid_profile_env'
    const profileCheckEnv = new ProfileCheck()
    const profileCheckResultEnv = profileCheckEnv.execute()
    const credsEnv: any = aws.config.credentials || {}
    profileCheckResultEnv.should.be.equals(true)
    credsEnv.accessKeyId.should.be.equal('validAccessKeyEnv')
    credsEnv.secretAccessKey.should.be.equal('validSecretAccessKeyEnv')
    credsEnv.sessionToken.should.be.equal('validSessionTokenEnv')

    const profileCheck = new ProfileCheck('valid_profile')
    const profileCheckResult = profileCheck.execute()
    const envProfileIsSet = process.env.AWS_PROFILE === 'valid_profile'
    const creds: any = aws.config.credentials || {}
    profileCheckResult.should.be.equals(true)
    envProfileIsSet.should.be.equals(true)
    creds.accessKeyId.should.be.equal('validAccessKey')
    creds.secretAccessKey.should.be.equal('validSecretAccessKey')
    creds.sessionToken.should.be.equal('validSessionToken')

    profileCheck.revert()
    const credsRev: any = aws.config.credentials || {}
    credsRev.accessKeyId.should.be.equal('validAccessKeyEnv')
    credsRev.secretAccessKey.should.be.equal('validSecretAccessKeyEnv')
    credsRev.sessionToken.should.be.equal('validSessionTokenEnv')
  }
}

import { SharedIniFileCredentials, TemporaryCredentials } from 'aws-sdk'
import * as aws from 'aws-sdk'

/**
 * From: https://docs.aws.amazon.com/cli/latest/topic/config-vars.html
 *
 * Credentials from environment variables have precedence over credentials
 * from the shared credentials and AWS CLI config file. Credentials specified
 * in the shared credentials file have precedence over credentials in the AWS
 * CLI config file. If AWS_PROFILE environment variable is set and the
 * AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are set,
 * then the credentials provided by AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 * will override the credentials located in the profile provided by AWS_PROFILE.
 */

export class ProfileCheck {
  private profile: string | undefined
  private previousData: { profile?: string; credentials?: any }
  private env: {
    accessKeyId?: string
    profile?: string
    secretAccessKey?: string
  }
  constructor(profile?: string) {
    this.profile = profile
    this.env = {}
    this.previousData = {}
  }

  execute(): boolean {
    this.setData()
    return this.profile ? this.getByProfileOpt() : this.getByEnv()
  }

  revert(): boolean {
    process.env.AWS_PROFILE = this.previousData.profile
    aws.config.credentials = this.previousData.credentials
    return true
  }

  setData(): void {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    const profile = process.env.AWS_PROFILE
    const credentials = aws.config.credentials
    this.previousData = { credentials, profile }
    this.env = { accessKeyId, profile, secretAccessKey }
  }

  private getByProfileOpt(): boolean {
    return this.checkProfile(this.profile) || this.getByEnv()
  }

  private getByEnv(): boolean {
    return this.keysInEnv() || this.checkProfile(this.env.profile || 'default')
  }

  private keysInEnv(): boolean {
    return !!(this.env.accessKeyId && this.env.secretAccessKey)
  }

  private checkProfile(profile: string | undefined): boolean {
    const creds = new SharedIniFileCredentials({ profile })
    const areValidCreds = creds.accessKeyId && creds.secretAccessKey
    return areValidCreds ? this.write(creds, profile) : false
  }

  private write(creds: SharedIniFileCredentials, profile?: string): boolean {
    aws.config.credentials = creds
    process.env.AWS_PROFILE = profile
    return true
  }
}

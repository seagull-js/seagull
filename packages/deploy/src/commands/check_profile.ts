import { SharedIniFileCredentials, TemporaryCredentials } from 'aws-sdk'
import * as aws from 'aws-sdk'

export class ProfileCheck {
  private profile: string | undefined
  private previousData: { profile?: string; credentials?: any }
  private env: {
    profile?: string
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
    const credentials = aws.config.credentials
    this.previousData = { credentials, profile: process.env.AWS_PROFILE }
    this.env = { profile: process.env.AWS_PROFILE }
  }

  private getByProfileOpt(): boolean {
    return this.checkProfile(this.profile) || this.getByEnv()
  }

  private getByEnv(): boolean {
    return this.checkProfile(this.env.profile || 'default')
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

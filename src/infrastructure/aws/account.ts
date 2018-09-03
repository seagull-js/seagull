/** @module AWS */
import { config, SharedIniFileCredentials, STS } from 'aws-sdk'

/**
 * The Account loads itself from various possible sources. If nothing given,
 * it will use the AWS profile 'default' and loads the credentials from your
 * `~/.aws/credentials` file.
 */
export class Account {
  /**
   * the AWS profile name, defaults to `'default'`
   */
  profile: string

  /**
   * the resulting aws credentials data object
   */
  credentials: SharedIniFileCredentials

  /**
   * checks whether the currently loaded account configuration can be used
   * for deployment, ... .
   */
  isValid: boolean = false

  /**
   * get an [[Account]] instance with the given profile.
   *
   * @param profile if not given, uses `'AWS_PROFILE'` env setting or 'default'
   */
  constructor(profile?: string) {
    this.profile = profile || process.env.AWS_PROFILE || 'default'
    this.credentials = this.loadFromDotFile()
    this.setEnvironmentConfiguration()
    this.isValid = !!this.credentials.accessKeyId
  }

  /**
   * load the AWS account ID via AWS STS and return it. Can be used as unique
   * "hash" for service names.
   */
  async getAccountId(): Promise<string> {
    const opts: STS.ClientConfiguration = { apiVersion: '2011-06-15' }
    const sts = new STS(opts)
    const result = await sts.getCallerIdentity().promise()
    return result.Account!
  }

  // use the AWS SDK to load the file and parse it automatically
  private loadFromDotFile() {
    const opts = { profile: this.profile }
    return new SharedIniFileCredentials(opts)
  }

  // set ENV variables correctly, overriding existing ones
  private setEnvironmentConfiguration(): void {
    config.credentials = this.credentials
    process.env.AWS_PROFILE = this.profile
  }
}

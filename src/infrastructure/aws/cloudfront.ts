/** @module AWS */
import { Resource } from 'cloudformation-declarations'
import { merge } from 'lodash'
import { S3 } from './s3'

/**
 * The CDN of AWS, takes care of caching and reducing load to your app.
 * It will split traffic between the app's API routes and static [[Assets]]
 * located at an S3 bucket.
 */
export class CloudFront {
  /**
   * The S3 bucket for storing assets. The bucket will be private and only
   * accessible through CloudFront and only the folder `/assets/*`.
   */
  // assets: Assets

  private accessOriginResourceName = 'appDistributionAccessIdentity'
  private appName: string
  private accountId: string
  private domains: string[]

  /**
   * Create a new CloudFront Configuration Image. This will also contain
   * the dedicated Assets folder directly linked and with permissions
   * configured.
   *
   * @param appName the name of the target app
   * @param accountId the ID of the AWS acccount, used as "unique" hash
   * @param domains a list of domains pointing to your app
   */
  constructor(appName: string, accountId: string, domains: string[] = []) {
    this.appName = appName
    this.accountId = accountId
    this.domains = domains
  }

  /**
   * Transforms itself into a CloudFormation Resource Template.
   */
  get resources(): { [name: string]: Resource } {
    const { appName, accountId, accessOriginResourceName: name } = this
    const assets = new S3(appName, accountId, name)
    return merge({}, assets, this.accessIdentity)
  }

  // identity-resource needed for communication between cloudfront and S3
  private get accessIdentity(): any {
    const Type = 'AWS::CloudFront::CloudFrontOriginAccessIdentity'
    const Comment = 'Default Access Identity for your seagull app'
    const CloudFrontOriginAccessIdentityConfig = { Comment }
    const Properties = { CloudFrontOriginAccessIdentityConfig }
    return { [this.accessOriginResourceName]: { Properties, Type } }
  }
}

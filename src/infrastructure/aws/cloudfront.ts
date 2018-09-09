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
  private bucketName: string = ''
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
    this.bucketName = assets.bucketName
    return merge({}, assets.resources, this.accessIdentity, this.distribution)
  }

  // identity-resource needed for communication between cloudfront and S3
  private get accessIdentity(): any {
    const Type = 'AWS::CloudFront::CloudFrontOriginAccessIdentity'
    const Comment = `Default Access Identity for ${this.appName}`
    const CloudFrontOriginAccessIdentityConfig = { Comment }
    const Properties = { CloudFrontOriginAccessIdentityConfig }
    return { [this.accessOriginResourceName]: { Properties, Type } }
  }

  private get distribution(): any {
    const Type = 'AWS::CloudFront::Distribution'
    const DistributionConfig = {
      Aliases: [], // TODO: Domains here!
      Comment: `CloudFront Distribution for ${this.appName}`,
      CustomErrorResponses: [],
      DefaultCacheBehavior: this.defaultCacheBehavior,
      Enabled: true,
      HttpVersion: 'http2',
      Origins: [this.wildcardOrigin],
    }
    const Properties = { DistributionConfig }
    return { distribution: { Properties, Type } }
  }

  private get defaultCacheBehavior() {
    return {
      AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
      Compress: true,
      DefaultTTL: 0,
      ForwardedValues: {
        Cookies: { Forward: 'none' },
        Headers: ['Origin'],
        QueryString: true,
      },
      MaxTTL: 0,
      MinTTL: 0,
      TargetOriginId: 's3-wildcard',
      ViewerProtocolPolicy: 'redirect-to-https',
    }
  }

  // private get assetsCacheBehavior() {
  //   return {
  //     AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
  //     CachedMethods: ['GET', 'HEAD', 'OPTIONS'],
  //     Compress: true,
  //     DefaultTTL: 3600,
  //     ForwardedValues: {
  //       Cookies: { Forward: 'none' },
  //       Headers: 'Origin',
  //       QueryString: true,
  //     },
  //     MaxTTL: 3600,
  //     MinTTL: 3600,
  //     PathPattern: 'assets/*',
  //     TargetOriginId: 's3-assets',
  //     ViewerProtocolPolicy: 'redirect-to-https',
  //   }
  // }

  private get wildcardOrigin() {
    return {
      DomainName: `${this.bucketName}.s3.amazonaws.com`,
      Id: 's3-wildcard',
      OriginPath: '/assets',
      S3OriginConfig: {
        OriginAccessIdentity: {
          'Fn::Join': [
            '',
            [
              'origin-access-identity/cloudfront/',
              { Ref: this.accessOriginResourceName },
            ],
          ],
        },
      },
    }
  }
}

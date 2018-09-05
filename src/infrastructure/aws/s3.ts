/** @module Loader */
import { AWS, Resource as AwsResource } from 'cloudformation-declarations'
import { merge } from 'lodash'

/**
 * This is the folder where assets are loaded from, implemented on top of
 * AWS S3. The web path `/assets/*` will be served from the path `/assets/*`
 * on the S3 bucket.
 */
export class S3 {
  private appName: string
  private access: string
  private accountId: string

  /**
   * Create a new S3 bucket for a given seagull app, protected by CloudFront.
   * The CloudFront-internal identifier for the bucket is `'appBucket'`.
   *
   * @param appName the actual name of the seagull app
   * @param accountId the AWS account ID, required for unique naming
   * @param access id-string for connecting the bucket with CloudFront
   */
  constructor(appName: string, accountId: string, access: string) {
    this.appName = appName
    this.accountId = accountId
    this.access = access
  }

  /**
   * Returns the CloudFormation Resources for a S3-Bucket with Policy
   */
  get resources(): { [name: string]: AwsResource } {
    return merge({}, this.bucket(), this.policy())
  }

  // generate CloudFormation Resource Template for a S3 Bucket
  private bucket(): { [name: string]: AWS.S3.Bucket } {
    const res: { [name: string]: AWS.S3.Bucket } = {}
    const Type = 'AWS::S3::Bucket'
    const BucketName = `${this.appName}-${this.accountId}-assets-bucket`
    const Properties = { AccessControl: 'Private', BucketName }
    return { appBucket: { Properties, Type } }
  }

  // generate CloudFormation Resource Template for a S3 Bucket Policy
  private policy() {
    const Type = 'AWS::S3::BucketPolicy'
    const Ref = 'appBucket'
    const CanonicalUser = { 'Fn::GetAtt': [this.access, 'S3CanonicalUserId'] }
    const Principal = { CanonicalUser }
    const Action = ['s3:GetObject', 's3:GetObjectAcl']
    const Effect = 'Allow'
    const Resource = { 'Fn::Join': ['', ['arn:aws:s3:::', { Ref }, '/*']] }
    const Statement = [{ Action, Effect, Principal, Resource }]
    const Properties = { Bucket: { Ref }, PolicyDocument: { Statement } }
    return { [`${Ref}Permission`]: { Properties, Type } }
  }
}

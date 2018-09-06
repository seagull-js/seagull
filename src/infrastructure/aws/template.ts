import { Resource } from 'cloudformation-declarations'
import { merge } from 'lodash'
import { CloudFront } from './cloudfront'
import { Provider } from './provider'

export class Template {
  /**
   * TODO: Lambda functions for the backend
   */
  functions = undefined

  /**
   * general configuration settings via the [[Provider]] class
   */
  provider: Provider

  /**
   * custom AWS resources, like cloudfront and S3
   */
  resources: { [name: string]: Resource }

  /**
   * the name of the target cloudformation stack
   */
  service: string

  /**
   * create a fresh serverless stack for AWS
   */
  constructor(name: string, description: string, accountId: string) {
    this.provider = new Provider(description)
    this.service = name
    const cf = new CloudFront(name, accountId, []).resources
    this.resources = merge({}, cf)
  }
}

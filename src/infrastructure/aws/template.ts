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
  resources: any = undefined

  /**
   * the name of the target cloudformation stack
   */
  service: string

  /**
   * create a fresh serverless stack for AWS
   */
  constructor(name: string, description: string) {
    this.provider = new Provider(description)
    this.service = name
  }
}

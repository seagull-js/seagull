export class Provider {
  /**
   * TODO: use the description from package.json
   */
  description: string

  /**
   * how much power does AWS lambda have? default is 1024
   */
  memorySize = 1536

  /**
   * the service provider this class describes, obviously 'AWS'
   */
  name = 'aws'

  /**
   * the region where to deploy the stack to, currently hardcoded
   */
  region = 'eu-west-1'

  /**
   * which language to use, node.js with 8.10 is the latest JS runtime on lambda
   */
  runtime = 'nodejs8.10'

  /**
   * which staging environment will it be? hardcoded 'prod'.
   */
  stage = 'prod'

  /**
   * api gateway maximum timeout for all HTTP requests
   */
  timeout = 30

  /**
   * some general configuration settings for an AWS cloudformation stack
   */
  constructor(description: string) {
    this.description = description
  }
}

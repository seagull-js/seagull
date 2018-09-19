import * as AWS from 'aws-sdk'
import { noop } from 'lodash'
import { Command } from '../../patterns'

/**
 * Command to write File to a specific S3 bucket
 */
export class ReadFile implements Command {
  /**
   * AWS Lambda stage environment
   */
  stage: 'prod' | 'dev'

  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(stage: 'prod' | 'dev', filePath: string) {
    this.stage = stage
    this.filePath = filePath
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    const params = this.generateS3Params()
    const client = new AWS.S3()
    const { Body } = await client.getObject(params).promise()
    return (Body || '').toString()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return noop()
  }

  private generateS3Params() {
    const Bucket = `scarlett-${this.stage}-data`
    return { Bucket, Key: this.filePath }
  }
}

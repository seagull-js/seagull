import * as AWS from 'aws-sdk'
import { Command } from '../../patterns'

/**
 * Command to write File to a specific S3 bucket
 */
export class WriteFile implements Command {
  /**
   * AWS Lambda stage environment
   */
  stage: 'prod' | 'dev'

  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * the payload to write into the file
   */
  content: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(stage: 'prod' | 'dev', filePath: string, content: string) {
    this.stage = stage
    this.filePath = filePath
    this.content = content
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    const params = this.generateS3Params()
    const client = new AWS.S3()
    return await client.putObject(params).promise()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    const params = this.generateS3Params()
    delete params.Body
    const client = new AWS.S3()
    return await client.deleteObject(params).promise()
  }

  private generateS3Params() {
    const Bucket = `scarlett-${this.stage}-data`
    return { Bucket, Key: this.filePath, Body: this.content }
  }
}

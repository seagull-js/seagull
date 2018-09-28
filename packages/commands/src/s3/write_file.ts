import { Command } from '@seagull/core'
import * as AWS from 'aws-sdk'

/**
 * Command to write File to a specific S3 bucket
 */
export class WriteFile implements Command {
  /**
   * name of the target bucket
   */
  bucketName: string

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
  constructor(bucketName: string, filePath: string, content: string) {
    this.bucketName = bucketName
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
    const Bucket = this.bucketName
    const Key = this.filePath
    const Body = this.content
    return { Bucket, Key, Body }
  }
}

import * as AWS from 'aws-sdk'
import { Command } from '../Command'

/**
 * Command to write File to a specific S3 bucket
 */
export class ReadFile implements Command {
  /**
   * name of the target bucket
   */
  bucketName: string

  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string) {
    this.bucketName = bucketName
    this.filePath = filePath
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    const params = { Bucket: this.bucketName, Key: this.filePath }
    const client = new AWS.S3()
    const { Body } = await client.getObject(params).promise()
    return (Body || '').toString()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return true
  }
}

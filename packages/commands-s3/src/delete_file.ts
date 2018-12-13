import { Command } from '@seagull/commands'
import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { S3Sandbox } from './s3_sandbox'

/**
 * Command to delete a File from a specific S3 bucket
 */
export class DeleteFile extends Command<
  PromiseResult<S3.DeleteObjectOutput, AWS.AWSError>
> {
  /**
   * name of the target bucket
   */
  bucketName: string

  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  executeConnected = this.executeCloud

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath
  }

  async executeCloud() {
    const params = { Bucket: this.bucketName, Key: this.filePath }
    const client = new AWS.S3()
    return await client.deleteObject(params).promise()
  }

  async executePure() {
    S3Sandbox.activate()
    const result = await this.executeCloud()
    S3Sandbox.deactivate()
    return result
  }
  async executeEdge() {
    // todo: use local fs
    throw new Error('Not Implemented')
    return undefined as any
  }

  /**
   * perform the command
   */
  async execute() {
    return this.executeHandler()
  }

  /**
   * revert the command
   */
  async revert() {
    return undefined as any
    // TODO: cache the file and restore it
  }
}

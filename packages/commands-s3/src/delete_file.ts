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
  executeCloud = this.exec.bind(this, new AWS.S3())
  executePure = this.exec.bind(this, S3Sandbox as any)
  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath
  }

  executeEdge = async () => {
    // TODO: use local fs
    throw new Error('Not Implemented')
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

  private async exec(client: AWS.S3) {
    const params = { Bucket: this.bucketName, Key: this.filePath }
    return await client.deleteObject(params).promise()
  }
}

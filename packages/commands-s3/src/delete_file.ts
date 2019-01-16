import { Command } from '@seagull/commands'
import { S3 as S3Mock } from '@seagull/mock-s3'
import { Mode } from '@seagull/mode'
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

  executeCloud = this.exec.bind(this, new AWS.S3())
  executePure = this.exec.bind(this, S3Sandbox as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  mock = new S3Mock()

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath
    // TODO: Maybe rework this?
    Mode.environment === 'edge' ? this.mock.activate() : this.mock.deactivate()
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

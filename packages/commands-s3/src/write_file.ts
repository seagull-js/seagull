import { Command } from '@seagull/commands'
import * as AWS from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { S3Sandbox } from './s3_sandbox'

/**
 * Command to write File to a specific S3 bucket
 */
export class WriteFile extends Command<
  PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>
> {
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

  executeConnected = this.executeCloud
  revertConnected = this.revertCloud

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string, content: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath
    this.content = content
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  async executeCloud() {
    const params = this.generateS3Params()
    const client = new AWS.S3()
    return await client.putObject(params).promise()
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

  async revert() {
    return this.revertHandler()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revertCloud() {
    const params = this.generateS3Params()
    delete params.Body
    const client = new AWS.S3()
    return await client.deleteObject(params).promise()
  }

  async revertPure() {
    S3Sandbox.activate()
    const result = await this.revertCloud()
    S3Sandbox.deactivate()
    return result
  }

  async revertEdge() {
    // todo: use local fs
    throw new Error('Not Implemented')
    return undefined as any
  }

  private generateS3Params() {
    const Bucket = this.bucketName
    const Key = this.filePath
    const Body = this.content
    return { Bucket, Key, Body }
  }
}

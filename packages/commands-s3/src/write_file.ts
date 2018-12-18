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
  executeCloud = this.exec.bind(this, new AWS.S3())
  executePure = this.exec.bind(this, S3Sandbox as any)

  revertConnected = this.execRevert.bind(this, new AWS.S3())
  revertPure = this.execRevert.bind(this, S3Sandbox as any)
  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath: string, content: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath
    this.content = content
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

  async revertEdge() {
    // todo: use local fs
    throw new Error('Not Implemented')
    return undefined as any
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  private async exec(client: AWS.S3) {
    const params = this.generateS3Params()
    return await client.putObject(params).promise()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  private async execRevert(client: AWS.S3) {
    const params = this.generateS3Params()
    delete params.Body
    return await client.deleteObject(params).promise()
  }

  private generateS3Params() {
    const Bucket = this.bucketName
    const Key = this.filePath
    const Body = this.content
    return { Bucket, Key, Body }
  }
}

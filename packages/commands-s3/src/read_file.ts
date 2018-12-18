import { Command } from '@seagull/commands'
import * as AWS from 'aws-sdk'
import { S3Sandbox } from './s3_sandbox'

/**
 * Command to write File to a specific S3 bucket
 */
export class ReadFile extends Command<string> {
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
    super()
    this.bucketName = bucketName
    this.filePath = filePath
  }

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  async executeCloud() {
    const params = { Bucket: this.bucketName, Key: this.filePath }
    const client = new AWS.S3()
    const { Body } = await client.getObject(params).promise()
    return (Body || '').toString()
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

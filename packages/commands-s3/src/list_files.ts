import { Command } from '@seagull/commands'
import * as AWS from 'aws-sdk'
import { S3Sandbox } from './s3_sandbox'

/**
 * Command to list all files in a specific bucket with an optional prefix
 */
export class ListFiles extends Command<string[]> {
  /**
   * name of the target bucket
   */
  bucketName: string

  /**
   * Prefix used for filtering the results
   */
  filePath: string

  executeConnected = this.executeCloud

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath?: string) {
    super()
    this.bucketName = bucketName
    this.filePath = filePath || ''
  }

  /**
   * perform the command
   */
  async executeCloud() {
    const params: any = { Bucket: this.bucketName, Prefix: this.filePath }
    const client = new AWS.S3()
    let truncated: boolean = true
    const results: string[] = []
    while (truncated) {
      const response = await client.listObjectsV2(params).promise()
      if (response.IsTruncated) {
        params.ContinuationToken = response.NextContinuationToken
      } else {
        truncated = false
      }
      response.Contents!.forEach(item => results.push(item.Key!))
    }
    return results
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

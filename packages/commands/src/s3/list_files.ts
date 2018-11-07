import * as AWS from 'aws-sdk'
import { Command } from '../Command'

/**
 * Command to list all files in a specific bucket with an optional prefix
 */
export class ListFiles implements Command {
  /**
   * name of the target bucket
   */
  bucketName: string

  /**
   * Prefix used for filtering the results
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(bucketName: string, filePath?: string) {
    this.bucketName = bucketName
    this.filePath = filePath || ''
  }

  /**
   * perform the command
   */
  async execute() {
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

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return true
  }
}

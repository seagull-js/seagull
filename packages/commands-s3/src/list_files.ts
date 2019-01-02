import { Command } from '@seagull/commands'
import { S3 as S3Mock } from '@seagull/mock-s3'
import { Mode } from '@seagull/mode'
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
  executeCloud = this.exec.bind(this, new AWS.S3())
  executePure = this.exec.bind(this, S3Sandbox as any)
  executeEdge = this.exec.bind(this, new AWS.S3())

  mock = new S3Mock()

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
  async execute() {
    //TODO: Maybe rework this?
    Mode.environment === 'edge' ? this.mock.activate() : this.mock.deactivate()
    return this.executeHandler()
  }

  /**
   * revert the command
   */
  async revert() {
    return undefined as any
    // TODO: cache the file and restore it
  }

  /**
   * perform the command
   */
  private async exec(client: AWS.S3) {
    const params: any = { Bucket: this.bucketName, Prefix: this.filePath }

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
}

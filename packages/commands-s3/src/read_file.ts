import { Command } from '@seagull/commands'
import { S3 as S3Mock } from '@seagull/mock-s3'
import { Mode } from '@seagull/mode'
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

  /**
   * write a file to the stack's dataBucket on AWS S3
   */
  private async exec(client: AWS.S3) {
    const params = { Bucket: this.bucketName, Key: this.filePath }
    const { Body } = await client.getObject(params).promise()
    return (Body || '').toString()
  }
}

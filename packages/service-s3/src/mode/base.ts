import { S3 as S3C } from '@seagull/commands-s3'
import { IMode } from '@seagull/mode'
import * as AWS from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { IS3 } from '../interface'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export abstract class S3Base implements IS3 {
  protected abstract mode: Readonly<IMode>

  async listFiles(bucketName: string, filePath?: string): Promise<string[]> {
    const cmd = new S3C.ListFiles(bucketName, filePath)
    cmd.mode = this.mode
    return await cmd.execute()
  }
  async readFile(bucketName: string, filePath: string): Promise<string> {
    const cmd = new S3C.ReadFile(bucketName, filePath)
    cmd.mode = this.mode
    return await cmd.execute()
  }
  async writeFile(
    bucketName: string,
    filePath: string,
    content: string
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const cmd = new S3C.WriteFile(bucketName, filePath, content)
    cmd.mode = this.mode
    return await cmd.execute()
  }
  async deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const cmd = new S3C.DeleteFile(bucketName, filePath)
    cmd.mode = this.mode
    return await cmd.execute()
  }
}

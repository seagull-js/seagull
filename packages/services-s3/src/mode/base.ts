import { S3 as S3C } from '@seagull/commands-s3'
import { IMode } from '@seagull/mode'
import * as AWS from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Error } from '../error'
import { IS3 } from '../interface'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export abstract class S3Base implements IS3 {
  protected abstract mode: Readonly<IMode>

  /**
   * Lists all files of a S3 bucket
   * @param bucketName bucket name
   * @param filePath file path
   * @throws {S3Error}
   */
  async listFiles(bucketName: string, filePath?: string): Promise<string[]> {
    const cmd = new S3C.ListFiles(bucketName, filePath)
    cmd.mode = this.mode
    return await cmd.execute() // TODO: figure out why this s3cmd has no error interface
  }

  /**
   * Reads a file from a S3 bucket
   * @param bucketName bucket name
   * @param filePath file path
   * @throws {S3Error}
   */
  async readFile(bucketName: string, filePath: string): Promise<string> {
    const cmd = new S3C.ReadFile(bucketName, filePath)
    cmd.mode = this.mode
    return await cmd.execute() // TODO: figure out why this s3cmd has no error interface
  }

  /**
   * Writes a file to a S3 bucket
   * @param bucketName bucket name
   * @param filePath file path
   * @param content file content
   * @throws {S3Error}
   */
  async writeFile(
    bucketName: string,
    filePath: string,
    content: string
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const cmd = new S3C.WriteFile(bucketName, filePath, content)
    cmd.mode = this.mode
    return await this.handle(cmd.execute())
  }

  async writeFiles(
    bucketName: string,
    files: Array<{ path: string; content: string }>
  ): Promise<Array<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>>> {
    // TODO: error handling & transaction
    const writePromises = []
    for (const file of files) {
      writePromises.push(this.writeFile(bucketName, file.path, file.content))
    }
    return await Promise.all(writePromises)
  }

  /**
   * Deletes a file from a S3 bucket
   * @param bucketName bucket name
   * @param filePath file path
   * @throws {S3Error}
   */
  async deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const cmd = new S3C.DeleteFile(bucketName, filePath)
    cmd.mode = this.mode
    return await this.handle(cmd.execute())
  }

  protected async handle(
    response: Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>>
  ): Promise<PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>> {
    const res = await response

    if (res && res.$response && res.$response.error) {
      throw new S3Error(
        `S3 error code ${res.$response.error.code}: ${
          res.$response.error.message
        }`,
        res
      )
    }

    return res
  }
}

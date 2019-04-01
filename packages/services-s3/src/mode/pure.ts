import { DeleteFile } from '@seagull/commands-s3/dist/src/delete_file'
import { ListFiles } from '@seagull/commands-s3/dist/src/list_files'
import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { WriteFile } from '@seagull/commands-s3/dist/src/write_file'
import { IMode } from '@seagull/mode'
import { FixtureStorage } from '@seagull/seed'
import { AWSError } from 'aws-sdk'
import { PutObjectOutput } from 'aws-sdk/clients/s3'
import { PromiseResult } from 'aws-sdk/lib/request'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { createResponse, PutFileFixture } from '../seed/fixture'
import { S3Base } from './base'

type S3Result = PromiseResult<PutObjectOutput, AWSError>

/**
 * Http pure mode implementation.
 */
@injectable()
export class S3Pure extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }

  async listFiles(bucketName: string, filePath?: string): Promise<string[]> {
    const cmd = new ListFiles(bucketName, filePath)
    return this.handleSeed<string[]>(cmd)
  }

  async readFile(bucketName: string, filePath: string): Promise<string> {
    const cmd = new ReadFile(bucketName, filePath)
    return this.handleSeed<string>(cmd)
  }

  async writeFile(
    bucketName: string,
    filePath: string,
    content: string
  ): Promise<PromiseResult<PutObjectOutput, AWSError>> {
    const cmd = new WriteFile(bucketName, filePath, content)
    return this.handleSeed<PutFileFixture, S3Result>(cmd, createResponse)
  }

  async deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<PromiseResult<PutObjectOutput, AWSError>> {
    const cmd = new DeleteFile(bucketName, filePath)
    return this.handleSeed<PutFileFixture, S3Result>(cmd, createResponse)
  }

  private async handleSeed<Fixture, O = Fixture>(
    cmd: ListFiles | ReadFile | WriteFile | DeleteFile,
    encapFnc: (fixture: Fixture) => O = x => (x as unknown) as O
  ): Promise<O> {
    const seed = FixtureStorage.createByS3Params<Fixture>(
      cmd.bucketName,
      cmd.filePath
    )
    const fixture = seed.get()
    if (!fixture) {
      throw new Error('Http: fixture (seed) is missing.')
    }
    if (seed.expired) {
      throw new Error('Http: fixture (seed) is expired.')
    }
    return encapFnc(fixture)
  }
}

import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { WriteFile } from '@seagull/commands-s3/dist/src/write_file'
import { IMode } from '@seagull/mode'
import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http pure mode implementation.
 */
@injectable()
export class S3Pure extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }

  async readFile(bucketName: string, filePath: string): Promise<string> {
    let data
    const cmd = new ReadFile(bucketName, filePath)
    try {
      data = await cmd.execute()
    } catch (e) {
      /** ignore */
    }
    if (data) {
      return data
    }
    const seed = FixtureStorage.createByS3Params<string>(
      cmd.bucketName,
      cmd.filePath
    )
    if (seed.expired) {
      throw new Error('S3: File not found and fixture (seed) is expired.')
    }
    data = seed.get()
    if (data) {
      const writeCmd = new WriteFile(bucketName, filePath, data)
      writeCmd.execute()
      return data
    }
    throw new Error('S3: File not found and fixture (seed) is missing.')
  }
}

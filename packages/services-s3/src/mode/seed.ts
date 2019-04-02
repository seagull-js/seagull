import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { IMode } from '@seagull/mode'
import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http seed implementation.
 */
@injectable()
export class S3Seed extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }

  async readFile(bucketName: string, filePath: string): Promise<string> {
    const cmd = new ReadFile(bucketName, filePath)
    const seed = FixtureStorage.createByS3Params<string>(
      cmd.bucketName,
      cmd.filePath
    )
    const seedFixture = seed.get()

    if (seedFixture && !seed.expired) {
      // seed exists => return seed
      return seedFixture
    }

    cmd.mode = this.mode
    let fixture = await cmd.execute()

    if (seed.config.hook) {
      fixture = seed.config.hook(fixture)
    }

    seed.set(fixture)

    return fixture
  }
}

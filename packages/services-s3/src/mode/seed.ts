import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { IMode } from '@seagull/mode'
import { FixtureStorage } from '@seagull/seed'
import * as fs from 'fs'
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

  async writeFolder(
    bucketName: string,
    path: string,
    includeSubfolders = true
  ) {
    const files = this.getFiles(path, includeSubfolders)
    this.writeFiles(bucketName, files)
  }

  private getFiles(
    path: string,
    includeSubfolders = true,
    filesRec?: Array<{ path: string; content: string }>
  ) {
    filesRec = filesRec || []
    const files = fs.readdirSync(path)
    for (const file of files) {
      const name = path + '/' + file
      if (includeSubfolders && fs.statSync(name).isDirectory()) {
        this.getFiles(name, includeSubfolders, filesRec)
      } else {
        const content = fs.readFileSync('DATA', 'utf8')
        filesRec.push({ path: name, content })
      }
    }
    return filesRec
  }
}

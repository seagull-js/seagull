import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { WriteFile } from '@seagull/commands-s3/dist/src/write_file'
import { IMode } from '@seagull/mode'
import { FixtureStorage } from '@seagull/seed'
import * as fs from 'fs'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http pure mode implementation.
 */
@injectable()
export class S3Pure extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }

  /**
   * Reads a file from a mocked S3 bucket or fixture
   * @param bucketName bucket name
   * @param filePath file path
   * @throws {S3Error}
   */
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
    throw { message: 'S3: File not found or empty.' }
  }

  /**
   * Writes a local folder to a mocked S3 bucket
   * @param bucketName bucket name
   * @param filePath file path
   * @param content file content
   * @throws {S3Error}
   */
  async writeFolder(
    bucketName: string,
    path: string,
    includeSubfolders = true
  ) {
    const pathLength = path.length
    const fsPaths = this.listFilesFS(path, includeSubfolders)
    for (const fsPath of fsPaths) {
      // cut out local path
      const s3Path = fsPath.substr(pathLength + 1)
      const content = fs.readFileSync(fsPath, 'utf8')
      this.writeFile(bucketName, s3Path, content)
    }
  }

  private listFilesFS(
    path: string,
    includeSubfolders = true,
    filesRec?: string[]
  ) {
    filesRec = filesRec || []
    const files = fs.readdirSync(path)
    for (const file of files) {
      const name = path + '/' + file
      if (includeSubfolders && fs.statSync(name).isDirectory()) {
        this.listFilesFS(name, includeSubfolders, filesRec)
      } else {
        filesRec.push(name)
      }
    }
    return filesRec
  }
}

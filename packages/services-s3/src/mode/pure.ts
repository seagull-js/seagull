import { IMode } from '@seagull/mode'
import * as fs from 'fs'
import { injectable } from 'inversify'
import { flatten } from 'lodash'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http pure mode implementation.
 */
@injectable()
export class S3Pure extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }

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
  private listFilesFS(path: string, includeSubfolders = true): string[] {
    const paths = fs.readdirSync(path).map(element => `${path}/${element}`)
    const isDirectory = (p: string) => fs.statSync(p).isDirectory()
    const files = paths.filter(p => !isDirectory(p))
    const directories = paths.filter(isDirectory)
    const noSubdirsNeeded = !includeSubfolders || !directories.length
    return noSubdirsNeeded ? files : this.addDirContents(files, directories)
  }

  private addDirContents(files: string[], directories: string[]) {
    const contents = directories.map(dir => this.listFilesFS(dir))
    const directoryFiles = flatten(contents)
    return files.concat(directoryFiles)
  }
}

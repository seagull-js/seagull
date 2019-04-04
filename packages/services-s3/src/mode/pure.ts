import { ReadFile } from '@seagull/commands-s3/dist/src/read_file'
import { IMode } from '@seagull/mode'
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

  /**
   * Returns all files within the path.
   * @param path path
   * @param includeSubfolders include subfolders
   * @param filePaths file path list (for recursion)
   */
  private listFilesFS(
    path: string,
    includeSubfolders = true,
    filePaths: string[] = []
  ) {
    const elementsInFolder = fs.readdirSync(path)

    for (const element of elementsInFolder) {
      const elementPath = `${path}/${element}`
      const isDirectory = fs.statSync(elementPath).isDirectory()
      const skipDirectory = isDirectory && !includeSubfolders

      if (skipDirectory) {
        continue
      }
      if (isDirectory) {
        //
        this.listFilesFS(elementPath, includeSubfolders, filePaths)
      } else {
        // add file
        filePaths.push(elementPath)
      }
    }

    return filePaths
  }
}

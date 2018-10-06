import * as fs from 'fs'
import { Command } from '../Command'

/**
 * Command to delete a file to the given filepath
 */
export class DeleteFile implements Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * internal memory to hold the content of the file in case a revert is needed
   */
  private cache: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    this.filePath = filePath
    this.cache = ''
  }

  /**
   * delete the target file. will hold a copy of the file's content for revert
   * cases until the command object is garbage collected.
   */
  async execute() {
    this.cache = fs.readFileSync(this.filePath, 'utf-8')
    return fs.unlinkSync(this.filePath)
  }

  /**
   * restore the deleted file from cache
   */
  async revert() {
    return fs.writeFileSync(this.filePath, this.cache, 'utf-8')
  }
}

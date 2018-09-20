import * as fs from 'fs'
import { noop } from 'lodash'
import { Command } from '../../patterns'

/**
 * Command to read a file from the given filepath
 */
export class Exists implements Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * check if a given file or folder path actually exists
   */
  async execute() {
    return fs.existsSync(this.filePath)
  }

  /**
   * do nothing
   */
  async revert() {
    return noop()
  }
}

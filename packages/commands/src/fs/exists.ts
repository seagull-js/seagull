import * as fs from 'fs'
import { Command } from '../Command'

/**
 * Command to read a file from the given filepath
 */
export class Exists extends Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    super()
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
    return true
  }
}

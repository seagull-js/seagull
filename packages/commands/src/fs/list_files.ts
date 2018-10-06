import * as fs from 'fs'
import { flatten } from 'lodash'
import { Command } from '../Command'

/**
 * Command to a files list from disk
 */
export class ListFiles implements Command {
  /**
   * Absolute Path to the folder
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * read a file list for usage later on other commands
   */
  async execute() {
    return fs.existsSync(this.filePath) ? this.listFiles(this.filePath) : []
  }

  /**
   * does nothing
   */
  async revert() {
    return true
  }

  listFiles(cwd: string): string[] {
    if (fs.lstatSync(cwd).isFile()) {
      return [cwd]
    } else {
      const names = fs.readdirSync(cwd)
      const list = names.map(f => this.listFiles(`${cwd}/${f}`))
      return flatten(list)
    }
  }
}

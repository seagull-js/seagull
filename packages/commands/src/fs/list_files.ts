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
   * Optional patern to filter the result list
   */
  pattern: RegExp | undefined

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string, pattern?: RegExp) {
    this.filePath = filePath
    this.pattern = pattern
  }

  /**
   * read a file list for usage later on other commands
   */
  async execute() {
    const exists = fs.existsSync(this.filePath)
    const list = exists ? this.listFiles(this.filePath) : []
    return this.pattern ? list.filter(f => this.pattern!.test(f)) : list
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

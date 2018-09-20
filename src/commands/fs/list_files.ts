import * as fs from 'fs'
import { flatten, noop } from 'lodash'
import { Command } from '../../patterns'

/**
 * Command to read a file from the given filepath
 */
export class ListFiles implements Command {
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
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    return this.listFiles(this.filePath)
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return noop()
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

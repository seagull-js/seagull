import { Command } from '@seagull/core'
import * as fs from 'fs'
import { noop } from 'lodash'

/**
 * Command to copy a file from [[filePathFrom]] to [[filePathTo]]
 */
export class CopyFile implements Command {
  /**
   * Absolute Path to the file source location
   */
  filePathFrom: string

  /**
   * Absolute Path to the file target location
   */
  filePathTo: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(from: string, to: string) {
    this.filePathFrom = from
    this.filePathTo = to
  }

  /**
   * copy a file from [[filePathFrom]] to [[filePathTo]]
   */
  async execute() {
    return fs.writeFileSync(this.filePathTo, fs.readFileSync(this.filePathFrom))
  }

  /**
   * remove a file from [[filePathTo]]
   */
  async revert() {
    return fs.unlinkSync(this.filePathTo)
  }
}

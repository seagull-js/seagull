import * as fs from 'fs'
import { noop } from 'lodash'
import { Command } from '../Command'

/**
 * Command to read a file from the given filepath
 */
export class ReadFile extends Command {
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
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    const exists = fs.existsSync(this.filePath)
    return exists ? fs.readFileSync(this.filePath, 'utf-8') : ''
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return true
  }
}

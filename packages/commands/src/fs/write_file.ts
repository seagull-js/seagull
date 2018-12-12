import * as fs from 'fs'
import { Command } from '../Command'

/**
 * Command to write a file to the given filepath
 */
export class WriteFile extends Command {
  /**
   * string content to write into the file
   */
  content: string

  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string, content: string) {
    super()
    this.content = content
    this.filePath = filePath
  }

  /**
   * write a [[content]] into a file on [[filePath]], creating intermediate
   * folders on-the-fly.
   */
  async execute() {
    const fragments = this.filePath.split('/')
    fragments.pop()
    const folder = fragments.join('/')
    require('mkdirp').sync(folder)
    return fs.writeFileSync(this.filePath, this.content, 'utf-8')
  }

  /**
   * delete the file on [[filePath]]. TODO: delete intermediate folders
   */
  async revert() {
    return fs.unlinkSync(this.filePath)
  }
}

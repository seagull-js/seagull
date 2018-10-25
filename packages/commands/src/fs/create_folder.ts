import { Command } from '../Command'

/**
 * Command to write a folder to disk (recursively)
 */
export class CreateFolder implements Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  folderPath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(folderPath: string) {
    this.folderPath = folderPath
  }

  /**
   * create [[folderPath]], including intermediate folders.
   */
  async execute() {
    require('mkdirp').sync(this.folderPath)
  }

  /**
   * TODO: be more than a noop
   */
  async revert() {
    return true
  }
}

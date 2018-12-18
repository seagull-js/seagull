import { Command } from '@seagull/commands'

/**
 * Command to write a folder to disk (recursively)
 */
export class CreateFolder extends Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  folderPath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(folderPath: string) {
    super()
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

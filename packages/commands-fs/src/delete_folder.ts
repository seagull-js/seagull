import { Command } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Command to delete a file to the given filepath
 */
export class DeleteFolder extends Command {
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
   * delete the target folder with all files in it recursively
   */
  async execute() {
    return rimraf(this.folderPath)
  }

  /**
   * restore the deleted file from cache
   */
  async revert() {
    return true // TODO: cache the deleted content somehow
  }
}

/**
 * Remove directory recursively
 * @param {string} folderPath
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(entry => {
      const entryPath = path.join(folderPath, entry)
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath)
      } else {
        fs.unlinkSync(entryPath)
      }
    })
    fs.rmdirSync(folderPath)
  }
}

import { Command } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to delete a file to the given filepath
 */
export class DeleteFolder extends Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  folderPath: string

  executeCloud = this.exec.bind(this, fs)
  executePure = this.exec.bind(this, FSSandbox.fs as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud
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
    return this.executeHandler()
  }

  /**
   * restore the deleted file from cache
   */
  async revert() {
    return true // TODO: cache the deleted content somehow
  }

  private async exec(fsModule: typeof fs) {
    return rimraf(fsModule, this.folderPath)
  }
}

/**
 * Remove directory recursively
 * @param {string} folderPath
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(fsModule: typeof fs, folderPath: string) {
  if (fsModule.existsSync(folderPath)) {
    fsModule.readdirSync(folderPath).forEach(entry => {
      const entryPath = path.join(folderPath, entry)
      if (fsModule.lstatSync(entryPath).isDirectory()) {
        rimraf(fsModule, entryPath)
      } else {
        fsModule.unlinkSync(entryPath)
      }
    })
    fsModule.rmdirSync(folderPath)
  }
}

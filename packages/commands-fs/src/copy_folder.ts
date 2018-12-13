import { Command } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Command to copy a file from [[folderPathFrom]] to [[folderPathTo]]
 */
export class CopyFolder extends Command {
  /**
   * Absolute Path to the file source location
   */
  folderPathFrom: string

  /**
   * Absolute Path to the file target location
   */
  folderPathTo: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(from: string, to: string) {
    super()
    this.folderPathFrom = from
    this.folderPathTo = to
  }

  /**
   * copy a file from [[folderPathFrom]] to [[folderPathTo]]
   */
  async execute() {
    copyDir(this.folderPathFrom, this.folderPathTo)
  }

  /**
   * remove a file from [[folderPathTo]]
   */
  async revert() {
    return fs.unlinkSync(this.folderPathTo)
  }
}

function copyDir(from: string, to: string) {
  fs.mkdirSync(to)
  for (const entry of fs.readdirSync(from)) {
    const srcPath = path.join(from, entry)
    const destPath = path.join(to, entry)
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

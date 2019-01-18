import { Command } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'
import { FSSandbox } from './fs_sandbox'

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

  executeCloud = this.exec.bind(this, fs)
  executePure = this.exec.bind(this, FSSandbox.fs as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  revertCloud = this.rev.bind(this, fs)
  revertPure = this.rev.bind(this, FSSandbox.fs as any)
  revertConnected = this.revertCloud
  revertEdge = this.revertCloud

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
    return this.executeHandler()
  }

  /**
   * remove a file from [[folderPathTo]]
   */
  async revert() {
    return this.revertHandler()
  }

  private async exec(fsModule: typeof fs) {
    copyDir(fsModule, this.folderPathFrom, this.folderPathTo)
  }

  private async rev(fsModule: typeof fs) {
    return fsModule.unlinkSync(this.folderPathTo)
  }
}

function copyDir(fsModule: typeof fs, from: string, to: string) {
  fsModule.mkdirSync(to)
  for (const entry of fsModule.readdirSync(from)) {
    const srcPath = path.join(from, entry)
    const destPath = path.join(to, entry)
    if (fsModule.lstatSync(srcPath).isDirectory()) {
      copyDir(fsModule, srcPath, destPath)
    } else {
      fsModule.copyFileSync(srcPath, destPath)
    }
  }
}

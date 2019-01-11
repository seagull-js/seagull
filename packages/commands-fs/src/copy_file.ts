import { Command } from '@seagull/commands'
import * as fs from 'fs'
import { FSSandbox } from './fs_sandbox'
/**
 * Command to copy a file from [[filePathFrom]] to [[filePathTo]]
 */
export class CopyFile extends Command {
  /**
   * Absolute Path to the file source location
   */
  filePathFrom: string

  /**
   * Absolute Path to the file target location
   */
  filePathTo: string

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
    this.filePathFrom = from
    this.filePathTo = to
  }

  /**
   * copy a file from [[filePathFrom]] to [[filePathTo]]
   */
  async execute() {
    return this.executeHandler()
  }

  /**
   * remove a file from [[filePathTo]]
   */
  async revert() {
    return this.revertHandler()
  }

  private async exec(fsModule: typeof fs) {
    return fsModule.copyFileSync(this.filePathFrom, this.filePathTo)
  }

  private async rev(fsModule: typeof fs) {
    return fsModule.unlinkSync(this.filePathTo)
  }
}

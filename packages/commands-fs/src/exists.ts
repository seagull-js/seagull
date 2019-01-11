import { Command } from '@seagull/commands'
import * as fs from 'fs'
import { FSSandbox } from './fs_sandbox'
/**
 * Command to read a file from the given filepath
 */
export class Exists extends Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  executeCloud = this.exec.bind(this, fs)
  executePure = this.exec.bind(this, FSSandbox.fs as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    super()
    this.filePath = filePath
  }

  /**
   * check if a given file or folder path actually exists
   */
  async execute() {
    return this.executeHandler()
  }

  async exec(fsModule: typeof fs) {
    return fsModule.existsSync(this.filePath)
  }

  /**
   * do nothing
   */
  async revert() {
    return true
  }
}

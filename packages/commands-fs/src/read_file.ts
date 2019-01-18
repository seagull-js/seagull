import { Command } from '@seagull/commands'
import * as fs from 'fs'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to read a file from the given filepath
 */
export class ReadFile extends Command {
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
   * write a file to the stack's dataBucket on AWS S3
   */
  async execute() {
    return this.executeHandler()
  }

  /**
   * remove a file from the stack's dataBucket on AWS S3
   */
  async revert() {
    return true
  }

  private async exec(fsModule: typeof fs) {
    const exists = fsModule.existsSync(this.filePath)
    return exists ? fsModule.readFileSync(this.filePath, 'utf-8') : ''
  }
}

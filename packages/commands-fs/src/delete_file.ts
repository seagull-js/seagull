import { Command } from '@seagull/commands'
import * as fs from 'fs'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to delete a file to the given filepath
 */
export class DeleteFile extends Command {
  /**
   * Absolute Path to the file including file name and extension
   */
  filePath: string

  executeCloud = this.exec.bind(this, fs)
  executePure = this.exec.bind(this, FSSandbox.fs as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  revertCloud = this.rev.bind(this, fs)
  revertPure = this.rev.bind(this, FSSandbox.fs as any)
  revertConnected = this.revertCloud
  revertEdge = this.revertCloud

  /**
   * internal memory to hold the content of the file in case a revert is needed
   */
  private cache: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string) {
    super()
    this.filePath = filePath
    this.cache = ''
  }

  /**
   * delete the target file. will hold a copy of the file's content for revert
   * cases until the command object is garbage collected.
   */
  async execute() {
    return this.executeHandler()
  }

  /**
   * restore the deleted file from cache
   */
  async revert() {
    return this.revertHandler()
  }

  private async exec(fsModule: typeof fs) {
    this.cache = fsModule.readFileSync(this.filePath, 'utf-8')
    return fsModule.unlinkSync(this.filePath)
  }

  private async rev(fsModule: typeof fs) {
    return fsModule.writeFileSync(this.filePath, this.cache, 'utf-8')
  }
}

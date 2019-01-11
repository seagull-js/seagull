import { Command } from '@seagull/commands'
import { FS } from '@seagull/mock-fs'
import * as fs from 'fs'
import { CreateFolder } from './create_folder'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to write a file to the given filepath
 */
export class WriteFile extends Command {
  /**
   * string content to write into the file
   */
  content: string

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
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string, content: string) {
    super()
    this.content = content
    this.filePath = filePath
  }

  /**
   * write a [[content]] into a file on [[filePath]], creating intermediate
   * folders on-the-fly.
   */
  async execute() {
    return this.executeHandler()
  }

  /**
   * delete the file on [[filePath]]. TODO: delete intermediate folders
   */
  async revert() {
    return this.revertHandler()
  }

  private async exec(fsModule: typeof fs) {
    const fragments = this.filePath.split('/')
    fragments.pop()

    const folder = fragments.join('/')
    const createFolderCmd = new CreateFolder(folder)
    createFolderCmd.mode = {
      ...createFolderCmd.mode,
      environment: this.mode.environment,
    }
    await createFolderCmd.execute()
    return fsModule.writeFileSync(this.filePath, this.content, 'utf-8')
  }

  private async rev(fsModule: typeof fs) {
    return fsModule.unlinkSync(this.filePath)
  }
}

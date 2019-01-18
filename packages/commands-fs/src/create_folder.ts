import { Command } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to write a folder to disk (recursively)
 */
export class CreateFolder extends Command {
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
   * create [[folderPath]], including intermediate folders.
   */
  async execute() {
    return await this.executeHandler()
  }

  /**
   * TODO: be more than a noop
   */
  async revert() {
    return true
  }

  private async exec(fsModule: typeof fs) {
    const segments = this.folderPath.split('/').filter(c => c!!)
    segments.reduce(createFolderInPath(fsModule), '/')
  }
}

const createFolderInPath = (fsModule: typeof fs) => (
  pathForFolder: string,
  folderName: string
) => {
  const newPath = `${pathForFolder}/${folderName}/`
  try {
    fsModule.mkdirSync(newPath)
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
  return newPath
}

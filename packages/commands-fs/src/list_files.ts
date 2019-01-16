import { Command } from '@seagull/commands'
import * as fs from 'fs'
import { flatten } from 'lodash'
import { FSSandbox } from './fs_sandbox'

/**
 * Command to a files list from disk
 */
export class ListFiles extends Command {
  /**
   * Absolute Path to the folder
   */
  filePath: string

  executeCloud = this.exec.bind(this, fs)
  executePure = this.exec.bind(this, FSSandbox.fs as any)
  executeConnected = this.executeCloud
  executeEdge = this.executeCloud

  /**
   * Optional patern to filter the result list
   */
  pattern: RegExp | undefined

  /**
   * see the individual property descriptions within this command class
   */
  constructor(filePath: string, pattern?: RegExp) {
    super()
    this.filePath = filePath
    this.pattern = pattern
  }

  /**
   * read a file list for usage later on other commands
   */
  async execute(): Promise<string[]> {
    return this.executeHandler()
  }

  /**
   * does nothing
   */
  async revert() {
    return true
  }

  listFiles(fsModule: typeof fs, cwd: string): string[] {
    if (fsModule.lstatSync(cwd).isFile()) {
      return [cwd]
    } else {
      const names = fsModule.readdirSync(cwd)
      const list = names.map(f => this.listFiles(fsModule, `${cwd}/${f}`))
      return flatten(list)
    }
  }

  private async exec(fsModule: typeof fs) {
    const exists = fsModule.existsSync(this.filePath)
    const list = exists ? this.listFiles(fsModule, this.filePath) : []
    return this.pattern ? list.filter(f => this.pattern!.test(f)) : list
  }
}

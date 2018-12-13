import { Command } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import * as ts from 'typescript'

export class Typescript extends Command {
  /** where to read a file from */
  srcFile: string

  /** where to write a bundle file to */
  dstFile: string

  /** actual tsconfig options */
  tsconfig: any

  constructor(srcFile: string, dstFile: string, tsconfig?: any) {
    super()
    this.srcFile = srcFile
    this.dstFile = dstFile
    this.tsconfig = tsconfig || {}
  }

  async execute() {
    const tsBlob = await new FS.ReadFile(this.srcFile).execute()
    const result = ts.transpileModule(tsBlob, this.tsconfig)
    const { diagnostics, outputText } = result
    // TODO: handle diagnostics
    await new FS.WriteFile(this.dstFile, outputText).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }
}

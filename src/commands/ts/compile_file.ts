import { FS } from '../'
import { Typescript } from '../../libraries'
import { Command } from '../../patterns'

/**
 * Command to compile a single typescript file
 */
export class CompileFile implements Command {
  /**
   * Absolute Path to the source file including file name and extension
   */
  fromFilePath: string

  /**
   * Absolute Path to the destination file including file name and extension
   */
  toFilePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(fromFilePath: string, toFilePath: string) {
    this.fromFilePath = fromFilePath
    this.toFilePath = toFilePath
  }

  /**
   * read a typescript file from disk, write the transpiled javascript to disk
   */
  async execute() {
    const text = await new FS.ReadFile(this.fromFilePath).execute()
    const code = Typescript.transpile(text)
    return await new FS.WriteFile(this.toFilePath, code).execute()
  }

  /**
   * delete the file on [[toFilePath]]
   */
  async revert() {
    return await new FS.DeleteFile(this.toFilePath)
  }
}

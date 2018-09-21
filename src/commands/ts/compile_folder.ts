import { FS } from '../'
import { Typescript } from '../../libraries'
import { Command } from '../../patterns'

/**
 * Command to write a file to the given filepath
 */
export class CompileFolder implements Command {
  /**
   * Absolute Path to the source file including file name and extension
   */
  fromFolderPath: string

  /**
   * Absolute Path to the destination file including file name and extension
   */
  toFilePath: string

  /**
   * see the individual property descriptions within this command class
   */
  constructor(fromFilePath: string, toFilePath: string) {
    this.fromFolderPath = fromFilePath
    this.toFilePath = toFilePath
  }

  /**
   * read typescript files from disk, write the transpiled javascripts to disk
   */
  async execute() {
    const from = this.fromFolderPath
    const to = this.toFilePath
    const list = await new FS.ListFiles(from).execute()
    const srcList = list.filter(file => /tsx?$/.test(file))
    for (const srcFile of srcList) {
      const dstFile = srcFile.replace(from, to).replace(/tsx?$/, 'js')
      const srcCode = await new FS.ReadFile(srcFile).execute()
      const dstCode = Typescript.transpile(srcCode)
      await new FS.WriteFile(dstFile, dstCode).execute()
    }
  }

  /**
   * delete the file on [[toFilePath]]
   */
  async revert() {
    return await new FS.DeleteFile(this.toFilePath)
  }
}

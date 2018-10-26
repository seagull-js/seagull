import { FS } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { Compile } from '../compile'
import { Queue } from './queue'

export class Compiler extends Queue {
  /**
   * reference to where the app code resides in
   */
  appFolder: string

  /**
   * object containing the contents of the tsconfig file
   */
  tsconfig: any

  constructor(appFolder: string) {
    super()
    this.appFolder = appFolder
  }

  async initialize() {
    this.tsconfig = await this.readTsconfig()
    const files = await this.listSourceFiles()
    files.forEach(f => this.registerSourceFile(f))
  }

  private async listSourceFiles() {
    const srcFolder = path.join(this.appFolder, 'src')
    return await new FS.ListFiles(srcFolder, /tsx?$/).execute()
  }

  private registerSourceFile(sourcePath: string) {
    const srcFolder = path.join(this.appFolder, 'src')
    const from = path.resolve(path.join(sourcePath))
    const fragment = path.relative(srcFolder, from).replace(/tsx?$/, 'js')
    const to = path.resolve(path.join(this.appFolder, 'dist', fragment))
    this.register(sourcePath, new Compile.Typescript(from, to, this.tsconfig))
  }

  private async readTsconfig() {
    const file = path.resolve(path.join(this.appFolder, 'tsconfig.json'))
    const exists = await new FS.Exists(file).execute()
    const reader = (filePath: string) => fs.readFileSync(filePath, 'utf-8')
    return exists ? ts.readConfigFile(file, reader).config : {}
  }
}

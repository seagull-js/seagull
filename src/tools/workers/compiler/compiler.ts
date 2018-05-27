/** @module Tools */
import * as fs from 'fs'
import * as http from 'http'
import * as log from 'npmlog'
import { join, relative, resolve } from 'path'
import * as ts from 'typescript'
import { Worker } from '../Worker'
import * as Transpile from './transpile'

export class Compiler extends Worker {
  /** where to write results to */
  dstFolder: string
  /** a parsed tsconfig file */
  tsConfig: object | undefined

  constructor(public srcFolder: string, public codeFolders: string[]) {
    super(srcFolder)
    this.dstFolder = join(this.srcFolder, '.seagull', 'dist')
    this.loadTsConfig()
  }

  async onFileCreated(filePath: string) {
    this.compileCodeFile(filePath)
  }

  async onFileChanged(filePath: string) {
    this.compileCodeFile(filePath)
  }

  async onFileRemoved(filePath: string) {
    this.deleteFile(filePath)
  }

  async watcherWillStart() {
    for (const folder of this.codeFolders) {
      if (fs.existsSync(join(this.srcFolder, folder))) {
        this.compileCodeFolder(folder)
      }
    }
  }

  private loadTsConfig() {
    const file = resolve(join(this.srcFolder, 'tsconfig.json'))
    const exists = fs.existsSync(file)
    const reader = (path: string) => fs.readFileSync(path, 'utf-8')
    this.tsConfig = exists ? ts.readConfigFile(file, reader).config : undefined
  }

  private compileCodeFolder(name: string): void {
    const from = resolve(join(this.srcFolder, name))
    const to = resolve(join(this.dstFolder, name))
    Transpile.transpileFolder(from, to, this.tsConfig)
  }

  private compileCodeFile(path: string): void {
    const from = resolve(path)
    const fragment = relative(this.srcFolder, from).replace(/tsx?$/, 'js')
    const to = resolve(join(this.dstFolder, fragment))
    Transpile.transpileFile(from, to, this.tsConfig)
  }

  private deleteFile(path: string): void {
    const from = resolve(path)
    const fragment = relative(this.srcFolder, from).replace(/tsx?$/, 'js')
    const to = resolve(join(this.dstFolder, fragment))
    fs.unlinkSync(to)
  }
}

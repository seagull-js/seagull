/** @module Tools */
import * as fs from 'fs'
import * as log from 'npmlog'
import { join, relative, resolve } from 'path'
import * as ts from 'typescript'
import { TsConfig } from '../../../scaffold'
import { Worker } from '../Worker'
import * as Transpile from './transpile'

/**
 * Custom implementation of a TS/TSX compiler. Respects the tsconfig file in
 * the target [[srcFolder]] or uses seagull-specific defaults.
 */
export class Compiler extends Worker {
  /** a parsed tsconfig file */
  config: any

  constructor(public srcFolder: string) {
    super(srcFolder)
    this.config = this.parseTsConfig()
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
    for (const folder of this.config.compilerOptions.rootDirs) {
      if (fs.existsSync(join(this.srcFolder, folder))) {
        this.compileCodeFolder(folder)
      }
    }
  }

  private compileCodeFolder(name: string): void {
    const from = resolve(join(this.srcFolder, name))
    const outDir = this.config.compilerOptions.outDir
    const to = resolve(join(this.srcFolder, outDir, name))
    Transpile.transpileFolder(from, to, this.config)
  }

  private compileCodeFile(path: string): void {
    const from = resolve(path)
    const fragment = relative(this.srcFolder, from).replace(/tsx?$/, 'js')
    const outDir = this.config.compilerOptions.outDir
    const to = resolve(join(this.srcFolder, outDir, fragment))
    Transpile.transpileFile(from, to, this.config)
  }

  private deleteFile(path: string): void {
    const from = resolve(path)
    const fragment = relative(this.srcFolder, from).replace(/tsx?$/, 'js')
    const outDir = this.config.compilerOptions.outDir
    const to = resolve(join(this.srcFolder, outDir, fragment))
    fs.unlinkSync(to)
  }

  private parseTsConfig() {
    const actual = this.loadTsConfigFile()
    return actual ? actual : TsConfig
  }

  private loadTsConfigFile() {
    const file = resolve(join(this.srcFolder, 'tsconfig.json'))
    const exists = fs.existsSync(file)
    const reader = (path: string) => fs.readFileSync(path, 'utf-8')
    return exists ? ts.readConfigFile(file, reader).config : undefined
  }
}

/** @module Tools */
import * as fs from 'fs'
import { noop } from 'lodash'
import * as log from 'npmlog'
import { join, relative, resolve } from 'path'
import * as ts from 'typescript'
import { TsConfig } from '../../scaffold'
import * as Transpile from '../util/transpile'
import { IWorker } from './interface'

/**
 * Custom implementation of a TS/TSX compiler. Respects the tsconfig file in
 * the target [[srcFolder]] or uses seagull-specific defaults.
 * See [[TsConfig]] from more details about default values.
 */
export class Compiler implements IWorker {
  /** a parsed tsconfig file */
  config: any

  constructor(public srcFolder: string) {
    this.config = this.parseTsConfig()
  }

  async onFileEvent(filePath: string) {
    filePath.match(/tsx?$/) ? this.compileCodeFile(filePath) : noop()
    log.info('[compiler]', 'updated:', relative(this.srcFolder, filePath))
  }

  async onFileRemoved(filePath: string) {
    filePath.match(/tsx?$/) ? this.deleteFile(filePath) : noop()
    log.info('[compiler]', 'removed:', relative(this.srcFolder, filePath))
  }

  async watcherWillStart() {
    for (const folder of this.config.compilerOptions.rootDirs) {
      if (fs.existsSync(join(this.srcFolder, folder))) {
        this.compileCodeFolder(folder)
        log.info('[compiler]', 'prepared:', relative(this.srcFolder, folder))
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
    log.info('[compiler]', 'loading settings from:', 'tsconfig.json')
    const exists = fs.existsSync(file)
    const reader = (path: string) => fs.readFileSync(path, 'utf-8')
    return exists ? ts.readConfigFile(file, reader).config : undefined
  }
}

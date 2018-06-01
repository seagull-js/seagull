/** @module Tools */
import * as fs from 'fs'
import * as log from 'npmlog'
import { join, relative, resolve } from 'path'
import * as browserify from 'browserify'
import * as sts from 'stream-string'
import * as browserifyInc from 'browserify-incremental'
import { Worker } from './worker'
import { writeFile } from '../util'

export class Bundler extends Worker {
  /** where the file walk should start at */
  entryFile: string
  /** where the result will be saved to */
  outFile: string
  /** source code cache object */
  codeCache = {}
  /** dependency cache object */
  dependencyCache = {}
  /** browserify instance */
  browserifyInstance: any

  constructor(public srcFolder: string) {
    super(srcFolder)
    this.entryFile = join(
      srcFolder,
      '.seagull',
      'dist',
      'src',
      'frontend',
      'index.js'
    )
    this.outFile = join(srcFolder, '.seagull', 'assets', 'bundle.js')
    this.createBundlerInstance()
  }

  async onFileCreated(filePath: string) {
    await this.bundle()
  }

  async onFileChanged(filePath: string) {
    await this.bundle()
  }

  async onFileRemoved(filePath: string) {
    await this.bundle()
  }

  async watcherWillStart() {
    await this.bundle()
  }

  private async bundle() {
    const stream = this.browserifyInstance.bundle()
    const content = await sts(stream)
    writeFile(this.outFile, content)
  }

  private createBundlerOpts(): browserify.Options {
    const ignoreMissing = true
    const cache = this.codeCache
    const packageCache = this.dependencyCache
    const paths = []
    paths.push(resolve(join(this.srcFolder, 'node_modules')))
    paths.push(resolve(join(process.cwd(), 'node_modules')))
    return { cache, ignoreMissing, packageCache, paths }
  }

  private createBundlerInstance() {
    const bfy = browserify(this.entryFile, this.createBundlerOpts())
    this.browserifyInstance = browserifyInc(bfy)
    this.browserifyInstance.on('time', (time: any) =>
      console.log('time (ms): ', time)
    )
  }
}

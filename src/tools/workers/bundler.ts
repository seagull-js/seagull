/** @module Tools */
import * as browserify from 'browserify'
import * as browserifyInc from 'browserify-incremental'
import * as fs from 'fs'
import * as log from 'npmlog'
import { join, relative, resolve } from 'path'
import * as sts from 'stream-string'
import { writeFile } from '../util'
import { IWorker } from './interface'

/**
 * Browserify fitted into the [[Worker]] interface, basically bundling the
 * frontend folder on every file event and on startup.
 * Works with caching, leveraging `browserify-incremental` for fast rebuilds on
 * all file events after the initial bundling on watcher start.
 * Does read the entry file for bundling from the project's `package.json` file
 * (the special `'browser'` field).
 */
export class Bundler implements IWorker {
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
    this.entryFile = join(srcFolder, this.getEntryFilePath())
    this.outFile = join(srcFolder, '.seagull', 'assets', 'bundle.js')
    this.createBundlerInstance()
  }

  async onFileEvent(filePath: string) {
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
      // tslint:disable-next-line:no-console
      console.log('time (ms): ', time)
    )
  }

  private getEntryFilePath() {
    const file = resolve(join(this.srcFolder, 'package.json'))
    const exists = fs.existsSync(file)
    const json = exists ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    return json.browser || '.seagull/dist/src/frontend/index.js'
  }
}

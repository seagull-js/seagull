import { Command, FS } from '@seagull/commands'
import * as browserify from 'browserify'
import * as browserifyInc from 'browserify-incremental'
import { join, resolve } from 'path'
import * as sts from 'stream-string'

export class Page implements Command {
  /** where to read a file from */
  srcFile: string

  /** where to write a bundle file to */
  dstFile: string

  /** source code cache object */
  codeCache = {}

  /** dependency cache object */
  dependencyCache: any

  /** browserify instance */
  browserifyInstance: any

  /** which npm packages to ignore */
  excludes: any[]

  constructor(srcFile: string, dstFile: string, cache?: any, excludes?: any[]) {
    this.srcFile = srcFile
    this.dstFile = dstFile
    this.dependencyCache = cache || {}
    this.excludes = excludes || []
    this.createBundlerInstance()
  }

  async execute() {
    const stream = this.browserifyInstance.bundle()
    const content = await sts(stream)
    await new FS.WriteFile(this.dstFile, content).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }

  private createBundlerOpts(): browserify.Options {
    const ignoreMissing = false
    const cache = this.codeCache
    const packageCache = this.dependencyCache
    const standalone = 'Page'
    const paths = [resolve(join(process.cwd(), 'node_modules'))]
    return { cache, ignoreMissing, packageCache, paths, standalone }
  }

  private createBundlerInstance() {
    const bfy = browserify(this.srcFile, this.createBundlerOpts())
    this.excludes.forEach(x => bfy.external(x))
    this.excludes.forEach(x => bfy.ignore(x))
    this.browserifyInstance = browserifyInc(bfy)
    // this.browserifyInstance.on('time', (time: any) =>
    //   // tslint:disable-next-line:no-console
    //   console.log('[Bundler]', `bundled frontend in ${time}ms`)
    // )
  }
}

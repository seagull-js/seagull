import { Command } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import * as browserify from 'browserify'
import * as browserifyInc from 'browserify-incremental'
import { join, resolve } from 'path'
import * as sts from 'stream-string'

export class Vendor extends Command {
  /** where to read a file from */
  packages: string[]

  /** where to write a bundle file to */
  dstFile: string

  /** source code cache object */
  codeCache = {}

  /** dependency cache object */
  dependencyCache: any

  /** browserify instance */
  browserifyInstance: any

  constructor(packages: string[], dstFile: string, cache?: any) {
    super()
    this.packages = packages
    this.dstFile = dstFile
    this.dependencyCache = cache || {}
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
    const paths = [resolve(join(process.cwd(), 'node_modules'))]
    return { cache, ignoreMissing, packageCache, paths }
  }

  private createBundlerInstance() {
    const bfy = browserify(this.createBundlerOpts())
    this.browserifyInstance = browserifyInc(bfy)
    this.browserifyInstance.require(this.packages)
    // this.browserifyInstance.on('time', (time: any) =>
    //   // tslint:disable-next-line:no-console
    //   console.log('[Bundler]', `bundled backend in ${time}ms`)
    // )
  }
}

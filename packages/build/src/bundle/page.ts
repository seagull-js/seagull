import { Command } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import * as browserify from 'browserify'
import * as browserifyInc from 'browserify-incremental'
import { join, resolve } from 'path'
import * as sts from 'stream-string'
import { addBabelTransform } from './transforms'

export class Page extends Command {
  /** where to read a file from */
  srcFile: string

  /** where to write a bundle file to */
  dstFile: string

  /** where to write a SSR bundle file to */
  dstFileSSR: string

  /** source code cache object */
  codeCache = {}

  /** source code cache object */
  codeCacheSSR = {}

  /** dependency cache object */
  dependencyCache: any

  /** dependency cache object */
  dependencyCacheSSR: any

  /** browserify instance */
  browserifyInstance!: browserify.BrowserifyObject

  /** browserify instance for ssr, without excluding vendor packages */
  browserifyInstanceSSR: any

  /** which npm packages to ignore */
  excludes: any[]

  constructor(srcFile: string, dstFile: string, cache?: any, excludes?: any[]) {
    super()
    this.srcFile = srcFile
    this.dstFile = dstFile
    this.dstFileSSR = dstFile.replace('.js', '-server.js')
    this.dependencyCache = cache || {}
    this.excludes = excludes || []
    this.createBundlerInstanceForSSR()
    this.createBundlerInstance()
  }

  async execute() {
    const stream = this.browserifyInstance.bundle()
    const content = await sts(stream)
    const streamSSR = this.browserifyInstanceSSR.bundle()
    const contentSSR = await sts(streamSSR)
    await new FS.WriteFile(this.dstFile, content).execute()
    await new FS.WriteFile(this.dstFileSSR, contentSSR).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFileSSR).execute()
    await new FS.DeleteFile(this.dstFile).execute()
  }

  private createBundlerOpts(ssr: boolean): browserify.Options {
    const ignoreMissing = false
    const cache = ssr ? this.codeCacheSSR : this.codeCache
    const packageCache = ssr ? this.dependencyCacheSSR : this.dependencyCache
    const standalone = 'Page'
    const paths = [resolve(join(process.cwd(), 'node_modules'))]
    return { cache, ignoreMissing, packageCache, paths, standalone }
  }

  private createBundlerInstance() {
    const bfy = browserify(this.srcFile, this.createBundlerOpts(false))
    this.excludes.forEach(x => bfy.external(x))
    this.excludes.forEach(x => bfy.ignore(x))
    addBabelTransform(bfy)
    this.browserifyInstance = browserifyInc(bfy)
    // this.browserifyInstance.on('time', (time: any) =>
    //   // tslint:disable-next-line:no-console
    //   console.log('[Bundler]', `bundled frontend in ${time}ms`)
    // )
  }

  private createBundlerInstanceForSSR() {
    const bfy = browserify(this.srcFile, this.createBundlerOpts(true))
    this.browserifyInstanceSSR = browserifyInc(bfy)
    // this.browserifyInstance.on('time', (time: any) =>
    //   // tslint:disable-next-line:no-console
    //   console.log('[Bundler]', `bundled frontend in ${time}ms`)
    // )
  }
}

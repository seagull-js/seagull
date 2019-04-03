import { FS } from '@seagull/commands-fs'
import * as bfy from 'browserify'
import { join, resolve } from 'path'
import * as sts from 'stream-string'
import * as wify from 'watchify'
import { getCacheRef } from './cache'
import { addBabelTransform, addEnvify, addUglifyify } from './transforms'

export class BrowserLibraryBundle {
  /** which packages should be bundle */
  packages: string[]
  /** where to write a bundle file to */
  dstFile: string
  /** ie11 etc. -> babel */
  compatible: boolean = false
  /** minimizing etc? */
  optimized: boolean = false

  constructor(packages: string[], dstFile: string) {
    this.packages = packages
    this.dstFile = dstFile
  }

  bfyInstance = (opts: bfy.Options) => bfy(opts).require(this.packages as any)
}

export class IsomorphicAppBundle {
  /** where to read a file from */
  srcFile: string
  /** where to write a bundle file to */
  dstFile: string
  /** exposed module variable */
  export: string = 'Page'
  /** which npm packages to ignore */
  excludes = [] as string[]
  /** ie11 etc. -> babel */
  compatible: boolean = false
  /** minimizing etc? */
  optimized: boolean = false

  constructor(srcFile: string, dstFile: string) {
    this.srcFile = srcFile
    this.dstFile = dstFile
  }

  bfyInstance = (opts: bfy.Options) =>
    bfy(this.srcFile, { opts, ...{ standalone: this.export } })
}

export class NodeAppBundle {
  /** where to read a file from */
  srcFile: string
  /** where to write a bundle file to */
  dstFile: string
  /** exposed module variable */
  export: string = 'default'
  /** minimizing etc? */
  optimized: boolean = false

  constructor(srcFile: string, dstFile: string) {
    this.srcFile = srcFile
    this.dstFile = dstFile
  }

  bfyInstance = (opts: bfy.Options) =>
    bfy(this.srcFile, { opts, ...{ node: true, standalone: this.export } })
}

export class Bundler {
  /** browserify instance */
  private bfy!: bfy.BrowserifyObject
  private bundlerType:
    | IsomorphicAppBundle
    | BrowserLibraryBundle
    | NodeAppBundle

  private watch = false
  private onBundled: (timing: [number, number]) => void
  private onError: (err: any) => void
  private bundlingTimer?: [number, number]

  constructor(
    bundlerType: Bundler['bundlerType'],
    onBundled: Bundler['onBundled'],
    onError: Bundler['onError'],
    watch = false
  ) {
    this.bundlerType = bundlerType
    this.watch = watch
    this.onBundled = onBundled
    this.onError = onError
    this.createBundlerInstance()
  }

  bundle = async () => {
    this.bundlingTimer = process.hrtime()
    const stream = this.bfy.bundle()
    this.addErrorLogging(stream)
    const content = await sts(stream)
    await new FS.WriteFile(this.bundlerType.dstFile, content).execute()
    this.onBundled(process.hrtime(this.bundlingTimer))
  }

  private bundlerOpts(): bfy.Options {
    const ignoreMissing = false
    const paths = [resolve(join(process.cwd(), 'node_modules'))]
    const { cache, packageCache } = getCacheRef(this.bundlerType)
    return { ignoreMissing, paths, cache, packageCache }
  }

  private createBundlerInstance() {
    this.bfy = this.bundlerType.bfyInstance(this.bundlerOpts())
    this.addExcludes()
    this.addCompatible()
    this.addOptimizations()
    this.addWatchMode()
  }

  private addExcludes() {
    const exclude = (item: string) => {
      this.bfy.external(item)
      this.bfy.ignore(item)
    }
    // tslint:disable-next-line:no-unused-expression
    'excludes' in this.bundlerType && this.bundlerType.excludes.forEach(exclude)
  }

  private addCompatible() {
    // tslint:disable-next-line:no-unused-expression
    'compatible' in this.bundlerType &&
      this.bundlerType.compatible &&
      addBabelTransform(this.bfy)
  }

  private addOptimizations() {
    if (!this.bundlerType.optimized) {
      return
    }
    addEnvify(this.bfy)
    addUglifyify(this.bfy)
  }

  private addWatchMode() {
    const opts: wify.Options = { delay: 10, ignoreWatch: true }
    // tslint:disable-next-line:no-unused-expression
    this.watch && this.bfy.plugin(wify as any, opts).on('update', this.bundle)
  }

  private addErrorLogging = (b: NodeJS.ReadableStream) =>
    b.on('error', this.onError)
}

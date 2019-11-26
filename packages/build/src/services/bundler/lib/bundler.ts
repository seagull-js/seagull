import { FS } from '@seagull/commands-fs'
import { createFileRecursive } from '@seagull/libraries'
import * as bfy from 'browserify'
import { join, resolve } from 'path'
import * as sts from 'stream-string'
import * as wify from 'watchify'
import { getCacheRef } from './cache'
import {
  addBabelTransform,
  addEnvify,
  addPageRenderExport,
  addUglifyify,
} from './transforms'

export class BrowserLibraryBundle {
  /** which packages should be bundle */
  packages: string[]
  /** where to write a bundle file to */
  dstFile: string
  /** ie11 etc. -> babel */
  compatible: boolean = false
  /** minimizing etc? */
  optimized: boolean = false

  constructor(cfg: {
    packages: string[]
    dstFile: string
    optimized?: boolean
    compatible?: boolean
  }) {
    this.packages = cfg.packages
    this.dstFile = cfg.dstFile
    this.compatible = cfg.compatible || this.compatible
    this.optimized = cfg.optimized || this.optimized
  }

  bfyInstance = (opts: bfy.Options) => bfy(opts).require(this.packages as any)
}

export class BrowserPageBundle {
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

  constructor(cfg: {
    srcFile: string
    dstFile: string
    excludes?: string[]
    compatible?: boolean
    optimized?: boolean
  }) {
    this.srcFile = cfg.srcFile
    this.dstFile = cfg.dstFile
    this.excludes = cfg.excludes || this.excludes
    this.compatible = cfg.compatible || this.compatible
    this.optimized = cfg.optimized || this.optimized
  }

  bfyInstance = (opts: bfy.Options) =>
    bfy(this.srcFile, { opts, ...{ standalone: this.export } })
}
export class ServerPageBundle {
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
  /** custom transforms */
  transforms = [addPageRenderExport]

  constructor(cfg: { srcFile: string; dstFile: string }) {
    this.srcFile = cfg.srcFile
    this.dstFile = cfg.dstFile
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
  excludes = [] as string[]
  /** minimizing etc? */
  optimized: boolean = false

  constructor(cfg: { srcFile: string; dstFile: string; excludes?: string[] }) {
    this.srcFile = cfg.srcFile
    this.dstFile = cfg.dstFile
    this.excludes = cfg.excludes || []
  }

  bfyInstance = (opts: bfy.Options) =>
    bfy(this.srcFile, { opts, ...{ node: true, standalone: this.export } })
}

export class Bundler {
  /** browserify instance */
  private bfy!: bfy.BrowserifyObject
  private bundlerType:
    | BrowserPageBundle
    | ServerPageBundle
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
    createFileRecursive(this.bundlerType.dstFile, content)
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
    addEnvify(this.bfy)
    this.addCustomTransformers()
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
    addUglifyify(this.bfy)
  }

  private addCustomTransformers() {
    // tslint:disable-next-line: no-unused-expression
    'transforms' in this.bundlerType &&
      this.bundlerType.transforms.forEach(t => t(this.bfy))
  }

  private addWatchMode() {
    const pollInterval = process.env.USE_POLLING ? 50000 : undefined
    const opts: wify.Options = {
      delay: 10,
      ignoreWatch: true,
      poll: pollInterval,
    }
    // tslint:disable-next-line:no-unused-expression
    this.watch && this.bfy.plugin(wify as any, opts).on('update', this.bundle)
  }

  private addErrorLogging = (b: NodeJS.ReadableStream) =>
    b.on('error', this.onError)
}

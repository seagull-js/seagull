import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '..'
import { BundleWorker } from './worker'

export const BundleBrowserPageEvent = Symbol('Start BrowserPage Bundling')
export const BundledBrowserPageEvent = Symbol('BrowserPage got Bundled event')
export const BundleBrowserPageErrorEvent = Symbol('Error on bundling')

export interface BrowserPageBundleServiceEvents extends OutputServiceEvents {
  [BundleBrowserPageEvent]: BrowserPageBundleService['handleBundling']
  [BundledBrowserPageEvent]: (time: [number, number]) => void
  [BundleBrowserPageErrorEvent]: () => void
}

export class BrowserPageBundleService {
  bus: ServiceEventBus<BrowserPageBundleServiceEvents>
  bundler!: BundleWorker
  config = {
    compatible: false,
    excludes: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
    optimized: false,
    page: '',
    watch: true,
  }
  constructor(
    bus: BrowserPageBundleService['bus'],
    config?: Partial<BrowserPageBundleService['config']>
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(BundleBrowserPageEvent, this.handleBundling)
    this.createBundler()
  }

  private createBundler() {
    const { src, dst } = this.bundlerPaths()
    const config = {
      compatible: this.config.compatible,
      dstFile: dst,
      excludes: this.config.excludes,
      optimized: this.config.optimized,
      srcFile: src,
    }
    this.bundler = new BundleWorker()
      .setWatchMode(this.config.watch)
      .configure('BrowserPageBundle', config)
      .connect(this.handleBundled, this.handleError)
  }
  private bundlerPaths() {
    const dist = join(process.cwd(), 'dist')
    const src = join(dist, 'pages', this.config.page + '.js')
    const dst = join(dist, 'assets', 'pages', this.config.page + '.js')
    return { src, dst }
  }

  private handleBundling = async (page: string) => {
    // tslint:disable-next-line:no-unused-expression
    page === this.config.page && this.bundler.bundle()
  }

  private handleBundled = (time: [number, number]) => {
    const logEventOpts = { time, page: this.config.page }
    this.bus.emit(LogEvent, 'BrowserPageBundleService', 'Bundled', logEventOpts)
    this.bus.emit(BundledBrowserPageEvent, time)
  }

  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'BrowserPageBundleService', 'BundleError', { err })
    this.bus.emit(BundleBrowserPageErrorEvent)
  }
}

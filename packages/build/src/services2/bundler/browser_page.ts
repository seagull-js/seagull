import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '..'
import { Bundler, IsomorphicAppBundle } from './lib/bundler'

export const BundleBrowserPageEvent = Symbol('Start BrowserPage Bundling')
export const BundledBrowserPageEvent = Symbol('BrowserPage got Bundled event')
export interface BrowserPageBundleServiceEvents extends OutputServiceEvents {
  [BundleBrowserPageEvent]: BrowserPageBundleService['handleBundling']
  [BundledBrowserPageEvent]: (page: string) => void
}

export class BrowserPageBundleService {
  bus: ServiceEventBus<BrowserPageBundleServiceEvents>
  bundler!: Bundler
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
    const bundle = new IsomorphicAppBundle(src, dst)
    bundle.optimized = this.config.optimized
    bundle.compatible = this.config.compatible
    bundle.excludes = this.config.excludes

    this.bundler = new Bundler(bundle, this.handleBundled, this.config.watch)
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

  private handleBundled = () => {
    this.bus.emit(BundledBrowserPageEvent, this.config.page)
  }
}

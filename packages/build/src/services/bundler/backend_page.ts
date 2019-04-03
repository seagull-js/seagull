import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '..'
import { Bundler, IsomorphicAppBundle } from './lib/bundler'

export const BundleBackendPageEvent = Symbol('Start BackendPage Bundling')
export const BundledBackendPageEvent = Symbol('BackendPage got Bundled event')
export const BundleBackendPageErrorEvent = Symbol('Error on bundling')
export interface BackendPageBundleServiceEvents extends OutputServiceEvents {
  [BundleBackendPageEvent]: BackendPageBundleService['handleBundling']
  [BundledBackendPageEvent]: (page: string) => void
  [BundleBackendPageErrorEvent]: () => void
}

export class BackendPageBundleService {
  bus: ServiceEventBus<BackendPageBundleServiceEvents>
  bundler!: Bundler
  config = {
    optimized: false,
    page: '',
    watch: true,
  }
  constructor(
    bus: BackendPageBundleService['bus'],
    config?: Partial<BackendPageBundleService['config']>
  ) {
    this.bus = bus.on(BundleBackendPageEvent, this.handleBundling)
    Object.assign(this.config, config)
    this.createBundler()
  }

  private createBundler() {
    const { src, dst } = this.bundlerPaths()
    const bundle = new IsomorphicAppBundle(src, dst)
    bundle.optimized = this.config.optimized
    this.bundler = new Bundler(
      bundle,
      this.handleBundled,
      this.handleError,
      this.config.watch
    )
  }

  private bundlerPaths() {
    const dist = join(process.cwd(), 'dist')
    const src = join(dist, 'pages', this.config.page + '.js')
    const dst = join(dist, 'assets', 'pages', this.config.page + '-server.js')
    return { src, dst }
  }

  private handleBundling = async (page: string) => {
    // tslint:disable-next-line:no-unused-expression
    page === this.config.page && this.bundler.bundle()
  }

  private handleBundled = (time: [number, number]) => {
    const logEventOpts = { time, page: this.config.page }
    this.bus.emit(LogEvent, 'BackendPageBundleService', 'Bundled', logEventOpts)
    this.bus.emit(BundledBackendPageEvent, this.config.page)
  }

  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'BackendPageBundleService', 'BundleError', { err })
    this.bus.emit(BundleBackendPageErrorEvent)
  }
}

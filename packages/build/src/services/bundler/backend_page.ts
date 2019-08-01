import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '..'
import { BundleWorker } from './worker'

export const BundleBackendPageEvent = Symbol('Start BackendPage Bundling')
export const BundledBackendPageEvent = Symbol('BackendPage got Bundled event')
export const BundleBackendPageErrorEvent = Symbol('Error on bundling')
export interface BackendPageBundleServiceEvents extends OutputServiceEvents {
  [BundleBackendPageEvent]: BackendPageBundleService['handleBundling']
  [BundledBackendPageEvent]: (time: [number, number]) => void
  [BundleBackendPageErrorEvent]: () => void
}

export class BackendPageBundleService {
  bus: ServiceEventBus<BackendPageBundleServiceEvents>
  bundler!: BundleWorker
  config = {
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
    const config = { srcFile: src, dstFile: dst }
    this.bundler = new BundleWorker()
      .setWatchMode(this.config.watch)
      .configure('ServerPageBundle', config)
      .connect(this.handleBundled, this.handleError)
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
    this.bus.emit(BundledBackendPageEvent, time)
  }

  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'BackendPageBundleService', 'BundleError', { err })
    this.bus.emit(BundleBackendPageErrorEvent)
  }
}

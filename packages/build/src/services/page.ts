import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'
import {
  BackendPageBundleService,
  BackendPageBundleServiceEvents,
  BrowserPageBundleService,
  BrowserPageBundleServiceEvents,
  BundleBackendPageErrorEvent,
  BundleBackendPageEvent,
  BundleBrowserPageErrorEvent,
  BundleBrowserPageEvent,
  BundledBackendPageEvent,
  BundledBrowserPageEvent,
} from './bundler'

export const BundlePageEvent = Symbol('Start page bundling')
export const BundledPageEvent = Symbol('page bundling completed')
export const BundlePageErrorEvent = Symbol('Error page bundling')
export interface PageBundleServiceEvents extends OutputServiceEvents {
  [BundlePageEvent]: PageBundleService['handleBundling']
  [BundledPageEvent]: (page: string) => void
  [BundlePageErrorEvent]: () => void
}

type BrowserPageBundlerBus = ServiceEventBus<BrowserPageBundleServiceEvents>
type BackendPageBundlerBus = ServiceEventBus<BackendPageBundleServiceEvents>

export class PageBundleService {
  bus!: ServiceEventBus<PageBundleServiceEvents>
  bundlerBus!: ServiceEventBus<
    BrowserPageBundleServiceEvents & BackendPageBundleServiceEvents
  >
  browserPageBundler!: BrowserPageBundleService
  backendPageBundler!: BackendPageBundleService
  bundled = new Set<'browser' | 'backend'>()

  config = {
    compatible: false,
    excludes: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
    optimized: false,
    page: '',
    watch: true,
  }
  constructor(
    bus: PageBundleService['bus'],
    config?: Partial<PageBundleService['config']>
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(BundlePageEvent, this.handleBundling)
    this.bundlerBus = new ServiceEventBus()
    this.bundlerBus.on(BundledBrowserPageEvent, this.handleBundled('backend'))
    this.bundlerBus.on(BundledBackendPageEvent, this.handleBundled('browser'))
    this.bundlerBus.on(BundleBrowserPageErrorEvent, this.emitError)
    this.bundlerBus.on(BundleBackendPageErrorEvent, this.emitError)
    this.createBackendPageBundler()
    this.createBrowserPageBundler()
    this.bundlerBus.on(LogEvent, (bus as any).emit.bind(this.bus, LogEvent))
  }

  private createBackendPageBundler = () => {
    const bus = this.bundlerBus as BackendPageBundlerBus
    const config = { page: this.config.page }
    this.backendPageBundler = new BackendPageBundleService(bus, config)
  }
  private createBrowserPageBundler = () => {
    const bus = this.bundlerBus as BrowserPageBundlerBus
    const config = { page: this.config.page }
    this.browserPageBundler = new BrowserPageBundleService(bus, config)
  }

  private handleBundling = async (page: string) => {
    if (this.config.page !== page) {
      return
    }
    this.bundlerBus.emit(BundleBackendPageEvent, page)
    this.bundlerBus.emit(BundleBrowserPageEvent, page)
  }

  private handleBundled = (type: 'browser' | 'backend') => () => {
    // tslint:disable-next-line:no-unused-expression
    this.bundled.add(type).size === 2 &&
      this.bus.emit(BundledPageEvent, this.config.page)
  }

  private emitError = () => this.bus.emit(BundlePageErrorEvent)
}

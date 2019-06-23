import { fork } from 'child_process'
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
  [BundledPageEvent]: (page: string, time: [number, number]) => void
  [BundlePageErrorEvent]: () => void
}

type BrowserPageBundlerBus = ServiceEventBus<BrowserPageBundleServiceEvents>
type BackendPageBundlerBus = ServiceEventBus<BackendPageBundleServiceEvents>

export class PageBundleService {
  bus!: ServiceEventBus<PageBundleServiceEvents>
  bundlerProcess!: any
  config: { page: string } & Partial<BrowserPageBundleService['config']> = {
    page: '',
  }
  constructor(
    bus: PageBundleService['bus'],
    config: PageBundleService['config']
  ) {
    Object.assign(this.config, config)
    const path = require.resolve('./pageWorker')
    this.bundlerProcess = fork(path, [], {
      env: {
        BUNDLER_ARGS: JSON.stringify(this.config),
      },
    })
    this.bundlerProcess.on('message', (m: any) => {
      switch (m.type) {
        case 'LogEvent':
          this.bus.emit(LogEvent, ...m.payload)
          break
        case 'BundlePageErrorEvent':
          this.bus.emit(BundlePageErrorEvent, ...m.payload)
          break
        case 'BundledPageEvent':
          this.bus.emit(BundledPageEvent, ...m.payload)
          break
      }
    })
    this.bus = bus.on(BundlePageEvent, this.handleBundling)
  }

  handleBundling = (page: string) =>
    this.bundlerProcess.send({ type: 'BundlePageEvent', payload: [page] })
}

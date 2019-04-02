import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'
import { Bundler, NodeAppBundle } from './lib/bundler'

export const BundleServerEvent = Symbol('Start backend Bundling')
export const BundledServerEvent = Symbol('Server got Bundled event')
export const BundleServerErrorEvent = Symbol('Error on bundling')

export interface ServerBundleServiceEvents extends OutputServiceEvents {
  [BundleServerEvent]: ServerBundleService['handleStartBundling']
  [BundledServerEvent]: () => void
  [BundleServerErrorEvent]: () => void
}

export class ServerBundleService {
  bus: ServiceEventBus<ServerBundleServiceEvents>
  bundler!: Bundler
  config = {
    optimized: false,
    watch: false,
  }
  constructor(
    bus: ServerBundleService['bus'],
    config: Partial<ServerBundleService['config']> = {}
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(BundleServerEvent, this.handleStartBundling)

    this.createBundler()
  }
  private createBundler() {
    const { src, dst } = this.bundlerPaths()
    const bundle = new NodeAppBundle(src, dst)
    bundle.optimized = this.config.optimized

    this.bundler = new Bundler(
      bundle,
      this.handleBundled,
      this.handleError,
      this.config.watch
    )
  }
  private bundlerPaths() {
    const cwd = process.cwd()
    const src = join(cwd, 'dist', 'server.js')
    const dst = join(cwd, 'dist', 'assets', 'backend', 'server.js')
    return { src, dst }
  }
  private handleStartBundling = async () => {
    this.bundler.bundle()
  }

  private handleBundled = () => {
    this.bus.emit(BundledServerEvent)
  }
  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'ServerBundleService', 'BundleError', { err })
    this.bus.emit(BundleServerErrorEvent)
  }
}

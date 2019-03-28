import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'
import { Bundler, NodeAppBundle } from './lib/bundler'

export const BundleServerEvent = Symbol('Start backend Bundling')
export const BundledServerEvent = Symbol('Server got Bundled event')
export interface ServerBundleServiceEvents extends OutputServiceEvents {
  [BundleServerEvent]: ServerBundleService['handleStartBundling']
  [BundledServerEvent]: () => void
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

    this.bundler = new Bundler(bundle, this.handleBundled, this.config.watch)
  }
  private bundlerPaths() {
    const cwd = process.cwd()
    const src = join(cwd, 'dist', 'lambda.js')
    const dst = join(cwd, 'dist', 'assets', 'backend', 'lambda.js')
    return { src, dst }
  }
  private handleStartBundling = async () => {
    this.bundler.bundle()
  }

  private handleBundled = () => {
    this.bus.emit(BundledServerEvent)
  }
}

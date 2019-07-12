import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'
import { BundleWorker } from './worker'

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
  bundler!: BundleWorker
  config = {
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
    this.bundler = new BundleWorker()
      .setWatchMode(this.config.watch)
      .configure('NodeAppBundle', { dstFile: dst, srcFile: src })
      .connect(this.handleBundled, this.handleError)
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

  private handleBundled = (time: [number, number]) => {
    this.bus.emit(LogEvent, 'ServerBundleService', 'Bundled', { time })
    this.bus.emit(BundledServerEvent)
  }
  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'ServerBundleService', 'BundleError', { err })
    this.bus.emit(BundleServerErrorEvent)
  }
}

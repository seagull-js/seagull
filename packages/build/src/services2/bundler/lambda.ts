import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '..'
import { Bundler, NodeAppBundle } from './lib/bundler'

export const BundleLambdaEvent = Symbol('Start backend Bundling')
export const BundledLambdaEvent = Symbol('Lambda got Bundled event')
export interface LambdaBundleServiceEvents extends OutputServiceEvents {
  [BundleLambdaEvent]: LambdaBundleService['handleStartBundling']
  [BundledLambdaEvent]: () => void
}

export class LambdaBundleService {
  bus: ServiceEventBus<LambdaBundleServiceEvents>
  bundler!: Bundler
  config = {
    optimized: false,
    watch: false,
  }
  constructor(
    bus: LambdaBundleService['bus'],
    config: Partial<LambdaBundleService['config']> = {}
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(BundleLambdaEvent, this.handleStartBundling)
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
    this.bus.emit(BundledLambdaEvent)
  }
}
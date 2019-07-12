import { ChildProcess, fork } from 'child_process'
import {
  BrowserLibraryBundle,
  BrowserPageBundle,
  NodeAppBundle,
  ServerPageBundle,
} from './lib/bundler'

const bundlerVariants = {
  BrowserLibraryBundle,
  BrowserPageBundle,
  NodeAppBundle,
  ServerPageBundle,
}

type BundleEvent = (timing: [number, number]) => void
type ErrorEvent = (err: any) => void
type BundlerVariants = keyof typeof bundlerVariants
type VariantOptions<type extends BundlerVariants> = ConstructorParameters<
  typeof bundlerVariants[type]
>[0]

export class BundleWorker {
  private bundler!: ChildProcess
  private watch = false
  configure<T extends BundlerVariants>(type: T, config: VariantOptions<T>) {
    const path = require.resolve('./lib/bundlerscript')
    const BUNDLER_ARGS = JSON.stringify({ config, type, watch: this.watch })
    this.bundler = fork(path, [], { env: { BUNDLER_ARGS } })
    return this
  }
  connect(handleBundled: BundleEvent, handleError: ErrorEvent) {
    const service = { handleBundled, handleError }
    type BWorkerEvent = { call: 'handleBundled' | 'handleError'; args: [any] }
    this.bundler.on('message', (m: BWorkerEvent) => service[m.call](...m.args))
    return this
  }

  setWatchMode = (watch = true) => void (this.watch = watch) || this
  bundle = () => this.bundler.send({ call: 'bundle' })
}

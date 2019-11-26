import { ChildProcess, fork } from 'child_process'
import * as onExit from 'signal-exit'
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

const bundlerScriptPath = () => {
  const localPath = './lib/bundlerscript'
  const jsDistPath = '../../../dist/src/services/bundler/lib/bundlerscript'
  try {
    return require.resolve(jsDistPath)
  } catch {
    return require.resolve(localPath)
  }
}

export class BundleWorker {
  private bundler!: ChildProcess
  private watch = false
  private bundlerArgs!: string
  private events!: { handleBundled: BundleEvent; handleError: ErrorEvent }

  configure<T extends BundlerVariants>(type: T, config: VariantOptions<T>) {
    this.bundlerArgs = JSON.stringify({ config, type, watch: this.watch })
    onExit(this.shutdown)
    return this
  }
  connect(handleBundled: BundleEvent, handleError: ErrorEvent) {
    this.events = { handleBundled, handleError }
    return this
  }

  setWatchMode = (watch = true) => void (this.watch = watch) || this
  shutdown = () => this.bundler && this.bundler.kill()

  bundle = () => (this.bundler || this.startBundler()).send({ call: 'bundle' })
  private startBundler = () => {
    const path = bundlerScriptPath()
    const service = this.events
    this.bundler = fork(path, [], {
      env: {
        BUNDLER_ARGS: this.bundlerArgs,
        USE_POLLING: process.env.USE_POLLING,
      },
    })
    type BWorkerEvent = { call: 'handleBundled' | 'handleError'; args: [any] }
    this.bundler.on('message', (m: BWorkerEvent) => service[m.call](...m.args))
    return this.bundler
  }
}

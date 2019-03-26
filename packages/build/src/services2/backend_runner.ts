import { EventEmitter } from 'events'
import * as mockRequire from 'mock-require'
import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'

export const StartBackendEvent = Symbol('Start code generation Event')
export const PageBundleRequested = Symbol(
  'Backend Runner requested page bundle'
)
export const PageBundleEmitted = Symbol(
  'Backend Runner has now access to a new bundle'
)
export interface BackendRunnerServiceEvents extends OutputServiceEvents {
  [StartBackendEvent]: BackendRunnerService['handleStart']
  [PageBundleRequested]: (page: string) => void
  [PageBundleEmitted]: (page: string) => void
}

export class BackendRunnerService {
  child!: any
  bus: ServiceEventBus<BackendRunnerServiceEvents>
  config = {
    script: join(process.cwd(), 'dist', 'runner.js'),
  }
  constructor(bus: BackendRunnerService['bus']) {
    this.patchFork()
    this.bus = bus
      .on(StartBackendEvent, this.handleStart)
      .on(PageBundleEmitted, this.handlePageBundleEmitted)
  }

  private handleStart = () => {
    const NodeDEV = require('node-dev')
    NodeDEV(this.config.script, [], [], { respawn: true })
  }

  private handlePageBundleEmitted = (page: string) =>
    this.child && this.child.send({ type: 'pageBundled', page })

  private pBundleRequested = (info: any) => {
    if (!info || info.type !== 'pageRenderRequested' || !info.page) {
      return
    }
    this.bus.emit(PageBundleRequested, info.page)
  }

  private patchFork() {
    const wrappedFork = (fork: any) => (...args: any) =>
      (this.child = fork(...args)).addListener('message', this.pBundleRequested)

    const get = (module: any, key: any) =>
      key === 'fork' ? wrappedFork(module[key]) : module[key]

    const childProcess = require('child_process')
    const proxy = new Proxy(childProcess, { get })
    mockRequire('child_process', proxy)
  }
}

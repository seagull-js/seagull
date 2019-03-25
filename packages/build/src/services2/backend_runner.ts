import * as NodeDEV from 'node-dev'
import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'
export const StartBackendEvent = Symbol('Start code generation Event')
export interface BackendRunnerServiceEvents extends OutputServiceEvents {
  [StartBackendEvent]: BackendRunnerService['handleStart']
}

export class BackendRunnerService {
  bus: ServiceEventBus<BackendRunnerServiceEvents>
  config = {
    script: join(process.cwd(), 'dist', 'runner.js'),
  }
  constructor(bus: BackendRunnerService['bus']) {
    this.bus = bus.on(StartBackendEvent, this.handleStart.bind(this))
  }

  handleStart() {
    NodeDEV(this.config.script, [], [], { respawn: true })
  }
}

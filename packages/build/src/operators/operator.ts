import * as Services from '../services2'
import { ServiceEventBus as EventBus } from '../services2'

export type ServicesMap = {
  Output: Services.OutputService
  Prepare: Services.PrepareService
  Compiler: Services.CompilerService
  CodeGenerator: Services.CodeGeneratorService
  BackendRunner: Services.BackendRunnerService
}
export type ServicesTypes = ServicesMap[keyof ServicesMap]
export type ServicesEvents = ServicesTypes['bus'] extends EventBus<infer U>
  ? (U & OperatorEvents)
  : never

export interface ReEmit {
  on: keyof ServicesEvents
  emit: keyof ServicesEvents
}
export interface ReEmitOnce {
  once: keyof ServicesEvents
  emit: keyof ServicesEvents
}
export type Wiring = ReEmit | ReEmitOnce

export const StartEvent = Symbol('Start event, starts operator operations')
export interface OperatorEvents {
  [StartEvent]: () => void
}

export class Operator extends EventBus<ServicesEvents> {
  static StartEvent = StartEvent
  services: ServicesMap = {} as any
  wiring: Wiring[] = []

  constructor() {
    super()
  }

  addOutputService() {
    const bus = this as EventBus<Services.OutputServiceEvents>
    this.services.Output = new Services.OutputService(bus, {})
  }

  addPrepareService(config?: Services.PrepareService['config']) {
    const bus = this as EventBus<Services.PrepareServiceEvents>
    this.services.Prepare = new Services.PrepareService(bus, config)
  }

  addCompileService(config?: Services.CompilerService['config']) {
    const bus = this as EventBus<Services.CompilerServiceEvents>
    this.services.Compiler = new Services.CompilerService(bus)
  }

  addCodeGeneratorService(config?: Services.CodeGeneratorService['config']) {
    const bus = this as EventBus<Services.CodeGeneratorServiceEvents>
    const service = new Services.CodeGeneratorService(bus, config)
    this.services.CodeGenerator = service
  }

  addBackendRunnerService(config?: Services.BackendRunnerService['config']) {
    const bus = this as EventBus<Services.BackendRunnerServiceEvents>
    this.services.BackendRunner = new Services.BackendRunnerService(bus)
  }

  setupWiring() {
    const wireOnce = ({ once, emit }: ReEmitOnce) =>
      this.once(once, (this as any).emit.bind(this, emit))
    const wireOn = ({ on, emit }: ReEmit) =>
      this.on(on, (this as any).emit.bind(this, emit))

    const wire = (wiring: Wiring) => {
      let _
      _ = 'on' in wiring && wireOn(wiring)
      _ = 'once' in wiring && wireOnce(wiring)
    }
    this.wiring.forEach(wire)
  }
}

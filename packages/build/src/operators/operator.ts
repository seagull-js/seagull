import * as Services from '../services2'
import { ServiceEventBus as EventBus } from '../services2'

export type ServicesMap = {
  Output: Services.OutputService
  Prepare: Services.PrepareService
  Compiler: Services.CompilerService
  CodeGenerator: Services.CodeGeneratorService
  BackendRunner: Services.BackendRunnerService
  LambdaBackend: Services.LambdaBundleService
  ServerBackend: Services.ServerBundleService
  VendorBundle: Services.VendorBundleService
  BrowserPage: Services.BrowserPageBundleService
  BackendPage: Services.BackendPageBundleService
  Page: Services.PageBundleService
}
export type ServicesTypes = ServicesMap[keyof ServicesMap]
export type ServicesEvents = ServicesTypes['bus'] extends EventBus<infer U>
  ? (U & OperatorEvents)
  : never

type ExplicitMessage = [Operator, symbol]
type Message = symbol | ExplicitMessage
export interface ReEmit {
  on: Message
  emit: Message
}
export interface ReEmitOnce {
  once: Message
  emit: Message
}
interface ExplicitWiring {
  type: 'on' | 'once'
  from: { ctx: Operator; event: symbol }
  to: { ctx: Operator; event: symbol }
}
export type Wiring = ReEmit | ReEmitOnce

export const StartEvent = Symbol('Start event, starts operator operations')
export const DoneEvent = Symbol('DONE event, emitted when operator is done')

export interface OperatorEvents {
  [StartEvent]: () => void
  [DoneEvent]: () => void
}

export class Operator extends EventBus<any> {
  static StartEvent = StartEvent
  static DoneEvent = DoneEvent
  services: ServicesMap = {} as any
  wiring: Wiring[] = []
  parent?: Operator

  constructor(parent?: Operator) {
    super()
    this.parent = parent
  }

  addOutputService() {
    const bus = this as EventBus<Services.OutputServiceEvents>
    this.services.Output = new Services.OutputService(bus, {})
  }

  addPrepareService(config?: Partial<Services.PrepareService['config']>) {
    const bus = this as EventBus<Services.PrepareServiceEvents>
    this.services.Prepare = new Services.PrepareService(bus, config)
  }

  addCompileService(config?: Partial<Services.CompilerService['config']>) {
    const bus = this as EventBus<Services.CompilerServiceEvents>
    this.services.Compiler = new Services.CompilerService(bus, config)
  }

  addCodeGeneratorService(
    config?: Partial<Services.CodeGeneratorService['config']>
  ) {
    const bus = this as EventBus<Services.CodeGeneratorServiceEvents>
    const service = new Services.CodeGeneratorService(bus, config)
    this.services.CodeGenerator = service
  }

  addBackendRunnerService(
    config?: Partial<Services.BackendRunnerService['config']>
  ) {
    const bus = this as EventBus<Services.BackendRunnerServiceEvents>
    this.services.BackendRunner = new Services.BackendRunnerService(bus)
  }

  addLambdaBackendService(
    config?: Partial<Services.LambdaBundleService['config']>
  ) {
    const bus = this as EventBus<Services.LambdaBundleServiceEvents>
    this.services.LambdaBackend = new Services.LambdaBundleService(bus, config)
  }

  addServerBackendService(
    config?: Partial<Services.ServerBundleService['config']>
  ) {
    const bus = this as EventBus<Services.ServerBundleServiceEvents>
    this.services.ServerBackend = new Services.ServerBundleService(bus, config)
  }

  addVendorBundleService(
    config?: Partial<Services.VendorBundleService['config']>
  ) {
    const bus = this as EventBus<Services.VendorBundleServiceEvents>
    this.services.VendorBundle = new Services.VendorBundleService(bus, config)
  }

  setupWiring() {
    const ctx = (m: Message) => (m instanceof Array ? m[0] : this)
    const event = (m: Message) => (m instanceof Array ? m[1] : m)

    const wire = ({ from, to, type }: ExplicitWiring) =>
      from.ctx[type](from.event, to.ctx.emit.bind(to.ctx, to.event as any))

    const getFromType = (wiring: Wiring) => {
      let type: 'on' | 'once' = 'on'
      type = 'on' in wiring ? 'on' : type
      type = 'once' in wiring ? 'once' : type
      return type
    }

    const buildWiringInfo = (
      type: 'on' | 'once',
      from: Message,
      to: Message
    ): ExplicitWiring => ({
      from: { ctx: ctx(from), event: event(from) },
      to: { ctx: ctx(to), event: event(to) },
      type,
    })

    const applyToOperator = (wiring: Wiring) => {
      const type = getFromType(wiring)
      const from: Message = (wiring as any)[type]

      const wireInfo = buildWiringInfo(type, from, wiring.emit)
      wire(wireInfo)
    }
    this.wiring.forEach(applyToOperator)
  }
}

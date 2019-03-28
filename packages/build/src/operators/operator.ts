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
  BrowserPage: Services.BrowserPageBundleService
  BackendPage: Services.BackendPageBundleService
  Page: Services.PageBundleService
}
export type ServicesTypes = ServicesMap[keyof ServicesMap]
export type ServicesEvents = ServicesTypes['bus'] extends EventBus<infer U>
  ? (U & OperatorEvents)
  : never

type ExplicitMessage = [Operator, keyof ServicesEvents]
type Message = keyof ServicesEvents | ExplicitMessage
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
  from: { ctx: Operator; event: keyof ServicesEvents }
  to: { ctx: Operator; event: keyof ServicesEvents }
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
  parent?: Operator

  constructor(parent?: Operator) {
    super()
    this.parent = parent
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

  addLambdaBackendService(config?: Services.LambdaBundleService['config']) {
    const bus = this as EventBus<Services.LambdaBundleServiceEvents>
    this.services.LambdaBackend = new Services.LambdaBundleService(bus)
  }

  addServerBackendService(config?: Services.ServerBundleService['config']) {
    const bus = this as EventBus<Services.ServerBundleServiceEvents>
    this.services.ServerBackend = new Services.ServerBundleService(bus)
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

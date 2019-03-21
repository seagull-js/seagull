import * as Services from '../services2'
import { LogEvent, ServiceEventBus as EventBus } from '../services2'

type ServicesMap = {
  Output: Services.OutputService
  Prepare: Services.PrepareService
  Compiler: Services.CompilerService
  CodeGenerator: Services.CodeGeneratorService
  BackendRunner: Services.BackendRunnerService
}
type ServicesTypes = ServicesMap[keyof ServicesMap]
type ServicesEvents = ServicesTypes['bus'] extends EventBus<infer U> ? U : never
interface Wiring {
  from: keyof ServicesEvents
  to: keyof ServicesEvents
}
export class Operator extends EventBus<ServicesEvents> {
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
    const wire = ({ from, to }: Wiring) =>
      this.on(from, (this as any).emit.bind(this, to))
    this.wiring.forEach(wire)
  }
}

const E = Services
class DevOperator extends Operator {
  wiring: Wiring[] = [
    { from: E.PreparedEvent, to: E.CompileEvent },
    { from: E.CompiledEvent, to: E.GenerateCodeEvent },
    { from: E.GeneratedCodeEvent, to: E.StartBackendEvent },
  ]

  constructor() {
    super()
    this.addDevServices()
    this.setupWiring()
  }

  addDevServices() {
    this.addPrepareService()
    this.addCodeGeneratorService()
    this.addCompileService()
    this.addOutputService()
  }
}

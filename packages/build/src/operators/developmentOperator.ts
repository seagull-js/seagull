import * as E from '../services2'
import { Operator, Wiring } from './operator'
import * as O from './operator'

export class DevOperator extends Operator {
  wiring: Wiring[] = [
    { on: O.StartEvent, emit: E.PrepareEvent },
    { on: E.PreparedEvent, emit: E.CompileEvent },
    { on: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: E.StartBackendEvent },
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
    this.addBackendRunnerService()
    this.addOutputService()
  }
}

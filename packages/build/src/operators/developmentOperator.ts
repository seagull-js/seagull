import * as E from '../services2'
import { LazyPageOperator } from './lazyPageOperator'
import { Operator, Wiring } from './operator'
import * as O from './operator'

export class DevOperator extends Operator {
  wiring: Wiring[] = [
    { on: O.StartEvent, emit: E.PrepareEvent },
    { on: E.PreparedEvent, emit: E.CompileEvent },
    { on: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: E.BundleVendorEvent },
    { once: E.GeneratedCodeEvent, emit: E.StartBackendEvent },
    { on: E.BundledPageEvent, emit: E.PageBundleEmitted },
  ]

  constructor() {
    super()
    this.addDevServices()
    this.setupWiring()
    this.addLazyPageOperator()
  }

  addDevServices() {
    this.addPrepareService()
    this.addCodeGeneratorService()
    this.addCompileService()
    this.addVendorBundleService()
    this.addBackendRunnerService()
    this.addOutputService()
  }

  addLazyPageOperator = () => new LazyPageOperator(this)
}

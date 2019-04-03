import * as E from '../services'
import { LazyPageOperator } from './lazyPageOperator'
import { Operator, Wiring } from './operator'
import * as O from './operator'

export class DevOperator extends Operator {
  wiring: Wiring[] = [
    { once: O.StartEvent, emit: E.PrepareEvent },
    { once: E.PreparedEvent, emit: E.CompileEvent },
    { on: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: E.BundleVendorEvent },
    { once: E.GeneratedCodeEvent, emit: E.StartBackendEvent },
    { on: E.BundledPageEvent, emit: E.PageBundleEmitted },
  ]
  startupTimer?: [number, number]

  constructor() {
    super()
    this.on(O.StartEvent, this.startTimer)

    this.addDevServices()
    this.setupWiring()
    this.addLazyPageOperator()

    this.on(E.StartBackendEvent, this.stopTimer)
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
  startTimer = () => (this.startupTimer = process.hrtime())
  stopTimer = () => {
    const time = process.hrtime(this.startupTimer)
    this.emit(E.LogEvent, 'DevOperator', 'Startup', { time })
  }
}

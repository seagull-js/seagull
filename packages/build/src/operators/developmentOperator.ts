import * as E from '../services'
import { LazyPageOperator } from './lazyPageOperator'
import { Operator, Wiring } from './operator'
import * as O from './operator'

export class DevelopmentOperator extends Operator {
  wiring: Wiring[] = [
    { once: O.StartEvent, emit: E.PrepareEvent },
    { once: E.PreparedEvent, emit: E.CompileEvent },
    { on: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: E.BundleVendorEvent },
    { once: E.GeneratedCodeEvent, emit: E.StartBackendEvent },
    { on: E.BundledPageEvent, emit: E.PageBundleEmitted },
  ]
  startupTimer?: [number, number]
  config = {
    compatible: false,
    fast: false,
    optimized: false,
  }

  constructor(config: any) {
    super()
    this.applyConfig(config)
    this.on(O.StartEvent, this.startTimer)

    this.addDevServices()
    this.setupWiring()
    this.addLazyPageOperator()

    this.on(E.StartBackendEvent, this.stopTimer)
  }

  applyConfig(config: any) {
    const mapped = {
      compatible: config.compatible,
      fast: !config.typeCheck,
      optimized: config.optimizeBundle,
    }
    Object.assign(this.config, mapped)
  }

  addDevServices() {
    const { optimized, compatible, fast } = this.config

    this.addPrepareService()
    this.addCodeGeneratorService()
    this.addCompileService({ watch: true, fast })
    this.addVendorBundleService({ optimized, compatible })
    this.addBackendRunnerService()
    this.addOutputService()
  }

  addLazyPageOperator = () => new LazyPageOperator(this, this.config)
  startTimer = () => (this.startupTimer = process.hrtime())
  stopTimer = () => {
    const time = process.hrtime(this.startupTimer)
    this.emit(E.LogEvent, 'DevelopmentOperator', 'Startup', { time })
  }
}

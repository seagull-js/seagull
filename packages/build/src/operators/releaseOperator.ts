import * as E from '../services'
import { Operator, Wiring } from './operator'
import { PageOperator } from './PageOperator'

export class ReleaseOperator extends Operator {
  startupTimer?: [number, number]
  wiring: Wiring[] = [
    { once: ReleaseOperator.StartEvent, emit: E.PrepareEvent },
    { once: E.PreparedEvent, emit: E.CompileEvent },
    { once: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: PageOperator.StartEvent },
    { once: E.GeneratedCodeEvent, emit: E.BundleVendorEvent },
    { once: PageOperator.DoneEvent, emit: E.BundleLambdaEvent },
    { once: PageOperator.DoneEvent, emit: E.BundleServerEvent },
  ]

  constructor() {
    super()
    this.setupWiring()
    this.addPageOperator()
    this.addReleaseServices()
    this.waitForDone()
      .then(this.stopTimer)
      .then(this.exitSuccess)
    this.on(ReleaseOperator.StartEvent, this.startTimer)

    this.on(E.CompileError, this.exitFailure)
    this.on(E.BundlePageErrorEvent, this.exitFailure)
    this.on(E.BundleLambdaErrorEvent, this.exitFailure)
    this.on(E.BundleVendorErrorEvent, this.exitFailure)
    this.on(E.BundleBackendPageErrorEvent, this.exitFailure)
  }

  addReleaseServices() {
    this.addPrepareService({ release: true })
    this.addCodeGeneratorService({ release: true })
    this.addCompileService({ watch: false })
    this.addVendorBundleService({ compatible: true, optimized: true })
    this.addLambdaBackendService({ optimized: false, watch: false })
    this.addServerBackendService({ optimized: false, watch: false })
    this.addOutputService()
  }
  addPageOperator = () =>
    new PageOperator(this, { optimized: true, compatible: true })

  waitForDone = () =>
    Promise.all([
      this.promisifyEmitOnce(E.BundledVendorEvent),
      this.promisifyEmitOnce(E.BundledLambdaEvent),
      this.promisifyEmitOnce(E.BundledServerEvent),
    ])
  exitSuccess = () => process.exit(0)
  exitFailure = () => process.nextTick(() => process.exit(1))

  startTimer = () => (this.startupTimer = process.hrtime())
  stopTimer = () => {
    const time = process.hrtime(this.startupTimer)
    this.emit(E.LogEvent, 'ReleaseOperator', 'Build', { time })
  }
}

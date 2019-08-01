import { coreRoundRobin } from '../lib/environment'
import * as E from '../services'
import { Operator, Wiring } from './operator'
import { PageOperator } from './pageOperator'

const notEmpty = (o: any) => !!o
const onlyOnWorker = <T>(i: number, value: T) =>
  coreRoundRobin(i) ? value : undefined

export class ReleaseOperator extends Operator {
  static DoneEvent = Symbol('Build completed')

  startupTimer?: [number, number]
  wiring = [
    { once: ReleaseOperator.StartEvent, emit: E.PrepareEvent },
    { once: E.PreparedEvent, emit: E.CompileEvent },
    { once: E.CompiledEvent, emit: E.GenerateCodeEvent },
    { once: E.GeneratedCodeEvent, emit: PageOperator.StartEvent },
    onlyOnWorker(0, { once: E.GeneratedCodeEvent, emit: E.BundleVendorEvent }),
    onlyOnWorker(1, { once: E.GeneratedCodeEvent, emit: E.BundleLambdaEvent }),
    onlyOnWorker(2, { once: E.GeneratedCodeEvent, emit: E.BundleServerEvent }),
  ].filter(notEmpty) as Wiring[]

  config = {
    compatible: true,
    fast: false,
    optimized: true,
  }

  constructor(config: any) {
    super()
    this.applyConfig(config)
    this.setupWiring()
    this.addPageOperator()
    this.addReleaseServices()
    this.waitForDone().then(this.stopTimer)
    this.on(ReleaseOperator.StartEvent, this.startTimer)

    this.on(E.CompileError, this.exitFailure)
    this.on(E.BundlePageErrorEvent, this.exitFailure)
    this.on(E.BundleLambdaErrorEvent, this.exitFailure)
    this.on(E.BundleVendorErrorEvent, this.exitFailure)
    this.on(E.BundleBackendPageErrorEvent, this.exitFailure)
  }

  applyConfig(config: any) {
    const mapped = {
      compatible: config.compatible,
      fast: !config.typeCheck,
      optimized: config.optimizeBundle,
    }
    Object.assign(this.config, mapped)
  }

  addReleaseServices() {
    const { optimized, compatible, fast } = this.config
    this.addPrepareService({ release: true })
    this.addCodeGeneratorService({ release: true })
    this.addCompileService({ watch: false, fast })
    this.addVendorBundleService({ optimized, compatible })
    this.addLambdaBackendService({ watch: false })
    this.addServerBackendService({ watch: false })
    this.addOutputService()
  }
  addPageOperator = () => new PageOperator(this, this.config)

  waitForDone = () =>
    Promise.all([
      this.promisifyEmitOnce(PageOperator.DoneEvent),
      onlyOnWorker(0, this.promisifyEmitOnce(E.BundledVendorEvent)),
      onlyOnWorker(1, this.promisifyEmitOnce(E.BundledLambdaEvent)),
      onlyOnWorker(2, this.promisifyEmitOnce(E.BundledServerEvent)),
    ].filter(notEmpty) as any)
  exitSuccess = () => process.exit(0)
  exitFailure = () => process.nextTick(() => process.exit(1))

  startTimer = () => (this.startupTimer = process.hrtime())
  stopTimer = () => {
    const time = process.hrtime(this.startupTimer)
    this.emit(E.LogEvent, 'ReleaseOperator', 'Build', { time })
    this.emit(ReleaseOperator.DoneEvent)
  }
}

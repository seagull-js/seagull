import * as E from '../services2'
import { Operator, Wiring } from './operator'
import { PageOperator } from './PageOperator'

export class ReleaseOperator extends Operator {
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
    this.waitForDone().then(this.exit)
  }

  addReleaseServices() {
    this.addPrepareService({ release: true })
    this.addCodeGeneratorService({ release: true })
    this.addCompileService({ watch: false })
    this.addVendorBundleService({ compatible: true, optimized: true })
    this.addLambdaBackendService({ optimized: true, watch: false })
    this.addServerBackendService({ optimized: true, watch: false })
    this.addOutputService()
  }
  addPageOperator = () => new PageOperator(this)

  waitForDone = () =>
    Promise.all([
      this.promisifyEmitOnce(E.BundledVendorEvent),
      this.promisifyEmitOnce(E.BundledLambdaEvent),
      this.promisifyEmitOnce(E.BundledServerEvent),
    ])
  exit = () => process.exit(0)
}

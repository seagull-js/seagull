import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'
import { getVendorBundleIncludes } from '../../lib/project'
import { BrowserLibraryBundle, Bundler } from './lib/bundler'

export const BundleVendorEvent = Symbol('Start Vendor Bundling Event')
export const BundledVendorEvent = Symbol('A Vendor Bundle got Bundled')
export const BundleVendorErrorEvent = Symbol('Error on bundling')

export interface VendorBundleServiceEvents extends OutputServiceEvents {
  [BundleVendorEvent]: VendorBundleService['handleStartBundling']
  [BundledVendorEvent]: () => void
  [BundleVendorErrorEvent]: () => void
}

export class VendorBundleService {
  bus: ServiceEventBus<VendorBundleServiceEvents>
  bundler!: Bundler
  config = {
    compatible: false,
    optimized: false,
    packages: getVendorBundleIncludes(),
  }
  constructor(
    bus: VendorBundleService['bus'],
    config?: Partial<VendorBundleService['config']>
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(BundleVendorEvent, this.handleStartBundling)
    this.createBundler()
  }

  private createBundler() {
    const dstFile = join(process.cwd(), 'dist', 'assets', 'static', 'vendor.js')
    const bundle = new BrowserLibraryBundle(this.config.packages, dstFile)
    bundle.optimized = this.config.optimized
    bundle.compatible = this.config.compatible

    this.bundler = new Bundler(bundle, this.handleBundled, this.handleError)
  }

  private handleStartBundling = async () => {
    this.bundler.bundle()
  }

  private handleBundled = (time: [number, number]) => {
    this.bus.emit(LogEvent, 'VendorBundleService', 'Bundled', { time })
    this.bus.emit(BundledVendorEvent)
  }
  private handleError = (err: any) => {
    this.bus.emit(LogEvent, 'VendorBundleService', 'BundleError', { err })
    this.bus.emit(BundleVendorErrorEvent)
  }
}

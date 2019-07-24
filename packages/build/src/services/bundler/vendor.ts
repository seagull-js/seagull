import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'
import { BrowserLibraryBundle, Bundler } from './lib/bundler'

export const BundleVendorEvent = Symbol('Start Vendor Bundling Event')
export const BundledVendorEvent = Symbol('A Vendor Bundle got Bundled')
export const BundleVendorErrorEvent = Symbol('Error on bundling')
export interface VendorBundleServiceEvents extends OutputServiceEvents {
  [BundleVendorEvent]: VendorBundleService['handleStartBundling']
  [BundledVendorEvent]: () => void
  [BundleVendorErrorEvent]: () => void
}

const includesDefault = [
  'react',
  'react-dom',
  'react-helmet',
  'lodash',
  'typestyle',
]

export class VendorBundleService {
  static get includes() {
    try {
      const json = require(`${process.cwd()}/package.json`)
      const includes = json.seagull.vendorBundleIncludes
      if (Array.isArray(includes)) {
        return includes
      }
      const add = includes.add as string[] | undefined
      const remove = includes.remove as string[] | undefined
      const includesSet = new Set<string>(includesDefault)
      if (Array.isArray(add)) {
        add.forEach(a => includesSet.add(a))
      }
      if (Array.isArray(remove)) {
        remove.forEach(r => includesSet.delete(r))
      }
      return Array.from(includesSet)
    } catch (e) {
      return includesDefault
    }
  }
  bus: ServiceEventBus<VendorBundleServiceEvents>
  bundler!: Bundler
  config = {
    compatible: false,
    optimized: false,
    packages: VendorBundleService.includes,
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

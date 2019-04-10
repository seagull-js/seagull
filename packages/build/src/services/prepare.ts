import {
  copyFolderRecursive,
  createFolderRecursive,
  removeFolderRecursive,
} from '@seagull/libraries'
import * as fsModule from 'fs'
import * as path from 'path'

import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'

export const PrepareEvent = Symbol('Prepare Event')
export const PreparedEvent = Symbol('Prepared Event')
export interface PrepareServiceEvents extends OutputServiceEvents {
  [PrepareEvent]: PrepareService['handlePrepare']
  [PreparedEvent]: () => void
}

/**
 * Service for preparing our dist folder for building or development. Ensures tasks like cleaning dist and creating important folders are handled properly.
 *
 * Input Event
 * - prepare
 * Output Events:
 * - prepared
 */
export class PrepareService {
  bus: ServiceEventBus<PrepareServiceEvents>
  fs: typeof fsModule
  config = {
    // Our working folder
    appFolder: process.cwd(),
    // will the output be a relase bundle?
    release: false,
  }
  constructor(
    bus: PrepareService['bus'],
    config?: Partial<PrepareService['config']>,
    fs = fsModule
  ) {
    this.fs = fs
    this.config = { ...this.config, ...config }
    this.bus = bus.on(PrepareEvent, this.handlePrepare.bind(this))
  }
  /**
   * Accepts a prepare event and executes our preparation
   * @param msg
   */
  handlePrepare() {
    const startPrepare = process.hrtime()
    this.config.release ? this.prepareRelease() : this.prepareDevelopment()
    this.bus.emit(LogEvent, 'PrepareService', 'prepared', {
      time: process.hrtime(startPrepare),
    })
    this.bus.emit(PreparedEvent)
  }

  private prepareRelease() {
    this.deleteDistFolder()
    this.createBackendFolder()
    this.createPagesFolder()
    this.copyStaticFolder()
  }

  private prepareDevelopment() {
    this.deleteDistFolder()
    this.createPagesFolder()
  }

  private deleteDistFolder() {
    const { appFolder } = this.config
    const location = path.join(appFolder, 'dist')
    removeFolderRecursive(location, this.fs)
  }

  private createBackendFolder() {
    const { appFolder } = this.config
    const location = path.join(appFolder, 'dist', 'assets', 'backend')
    createFolderRecursive(location, this.fs)
  }
  private createPagesFolder() {
    const { appFolder } = this.config
    const location = path.join(appFolder, 'dist', 'assets', 'pages')
    createFolderRecursive(location, this.fs)
  }
  private copyStaticFolder() {
    const { appFolder } = this.config
    const from = path.join(appFolder, 'static')
    const to = path.join(appFolder, 'dist', 'assets', 'static')
    copyFolderRecursive(from, to, this.fs)
  }
}

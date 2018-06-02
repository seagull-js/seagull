/** @module Tools */
import * as chokidar from 'chokidar'
import { noop } from 'lodash'
import { join, resolve } from 'path'
import { strategies } from './strategies'
import { Worker } from './workers'

/**
 * Main Process for the development server: watches the current project folder,
 * triggers [[Worker]] on file system changes
 */
export default class Watcher {
  /**
   * directory names where code resides
   */
  codeFolders = ['backend', 'frontend', 'lib']

  /**
   * where to read files from
   */
  srcFolder: string

  /**
   * instance of the watcher
   */
  watcher: chokidar.FSWatcher | undefined

  /**
   * the list of workers to invoke on events (ordering matters!)
   */
  private workers: Worker[]

  /**
   * sets up common settings like folder paths and initializes Workers
   */
  constructor(srcFolder: string, strategyName: string = 'default') {
    this.srcFolder = resolve(srcFolder)
    this.workers = strategies[strategyName](this)
  }

  /**
   * start the watching process and trigger all worker's lifecycle hooks.
   * Ordering of the workers DO matter!
   */
  async start() {
    await this.triggerPreWatchingHook()
    this.createWatcher()
    this.registerFileAddEvents()
    this.registerFileChangedEvents()
    this.registerFileRemovedEvents()
    await this.triggerPostWatchingHook()
  }

  async stop() {
    await this.triggerPreStoppingHook()
    this.watcher!.close()
    await this.triggerPostStoppingHook()
  }

  private createWatcher() {
    const folders = this.codeFolders.map(f => join(this.srcFolder, f))
    this.watcher = chokidar.watch(folders, { ignoreInitial: true })
  }

  private async triggerPreWatchingHook() {
    for (const worker of this.workers) {
      const handler = worker.watcherWillStart || noop
      await handler()
    }
  }

  private async triggerPostWatchingHook() {
    for (const worker of this.workers) {
      const handler = worker.watcherDidStart || noop
      await handler()
    }
  }

  private async triggerPreStoppingHook() {
    for (const worker of this.workers) {
      const handler = worker.watcherWillStop || noop
      await handler
    }
  }

  private async triggerPostStoppingHook() {
    for (const worker of this.workers) {
      const handler = worker.watcherDidStop || noop
      await handler()
    }
  }

  private registerFileAddEvents() {
    this.watcher!.on('add', async (filePath: string) => {
      for (const worker of this.workers) {
        const handler = worker.onFileCreated || worker.onFileEvent || noop
        await handler(filePath)
      }
    })
  }

  private registerFileChangedEvents() {
    this.watcher!.on('change', async (filePath: string) => {
      for (const worker of this.workers) {
        const handler = worker.onFileChanged || worker.onFileEvent || noop
        await handler
      }
    })
  }

  private registerFileRemovedEvents() {
    this.watcher!.on('unlink', async (filePath: string) => {
      for (const worker of this.workers) {
        const handler = worker.onFileRemoved || worker.onFileEvent || noop
        await handler(filePath)
      }
    })
  }
}

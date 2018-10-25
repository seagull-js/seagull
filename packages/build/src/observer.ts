import * as chokidar from 'chokidar'
import * as path from 'path'

export interface ObserverProps {
  vendor?: string[]
}

/**
 * Process an app foldr incrementally
 */
export class Observer {
  /**
   * path to the app folder
   */
  srcFolder: string

  /**
   * configuration options for the observer
   */
  props: ObserverProps

  /**
   * instance of chokidar that may be running
   */
  private watcher: chokidar.FSWatcher | undefined

  /**
   * initialize the Observer with configuration
   */
  constructor(srcFolder: string, props?: ObserverProps) {
    this.srcFolder = path.resolve(srcFolder)
    this.props = props || {}
  }

  /**
   * This code runs before the actual observer/watcher will begin it's work.
   * Can be used standalone for one-off building.
   */
  async initialize() {
    // do stuff before the watcher runs
  }

  async start() {
    await this.initialize()
    const folder = path.join(this.srcFolder, 'src')
    const opts = { ignoreInitial: true }
    this.watcher = chokidar.watch(folder, opts)
  }

  async stop() {
    return this.watcher && this.watcher.close()
  }
}

import { FS } from '@seagull/commands'
import * as chokidar from 'chokidar'
import * as path from 'path'
import { Bundler, Cleaner, Compiler, Generator } from './services'

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

  // internal worker services
  private watcher: chokidar.FSWatcher | undefined
  private cleaner: Cleaner
  private compiler: Compiler
  private generator: Generator
  private bundler: Bundler

  /**
   * initialize the Observer with configuration
   */
  constructor(srcFolder: string, props?: ObserverProps) {
    this.srcFolder = path.resolve(srcFolder)
    this.props = props || {}
    this.cleaner = new Cleaner(this.srcFolder)
    this.compiler = new Compiler(this.srcFolder)
    this.generator = new Generator(this.srcFolder)
    this.bundler = new Bundler(this.srcFolder, this.props.vendor)
  }

  /**
   * This code runs before the actual observer/watcher will begin it's work.
   * Can be used standalone for one-off building.
   */
  async initialize() {
    await this.cleaner.initialize()
    await this.cleaner.processAll()
    await this.compiler.initialize()
    await this.compiler.processAll()
    await this.generator.initialize()
    await this.generator.processAll()
    await this.bundler.initialize()
    await this.bundler.processAll()
  }

  async start() {
    const timeStart = new Date().getTime()
    await this.initialize()
    const folder = path.join(this.srcFolder, 'src')
    const opts = { ignoreInitial: true }
    this.watcher = chokidar.watch(folder, opts)
    const duration = new Date().getTime() - timeStart
    // tslint:disable-next-line:no-console
    console.log(`processed app initially in ${duration}ms`)
    this.registerFileAddEvents()
    this.registerFileChangedEvents()
    this.registerFileRemovedEvents()
  }

  async stop() {
    return this.watcher && this.watcher.close()
  }

  private registerFileAddEvents() {
    this.watcher!.on('add', async (filePath: string) => {
      const timeStart = new Date().getTime()
      if (/tsx?$/.test(filePath)) {
        this.compiler.registerSourceFile(filePath)
        await this.compiler.processOne(filePath)
        await this.generator.processAll()
        if (filePath.startsWith(path.join(this.srcFolder, 'src', 'pages'))) {
          this.bundler.registerPage(filePath)
        }
        await this.bundler.processPages()
        const duration = new Date().getTime() - timeStart
        // tslint:disable-next-line:no-console
        console.log(`added ${filePath} in ${duration}ms`)
      } else {
        this.cleaner.processOne('copy-static')
      }
    })
  }

  private registerFileChangedEvents() {
    this.watcher!.on('change', async (filePath: string) => {
      const timeStart = new Date().getTime()
      if (/tsx?$/.test(filePath)) {
        await this.compiler.processOne(filePath)
        await this.generator.processAll()
        await this.bundler.processPages()
        const duration = new Date().getTime() - timeStart
        // tslint:disable-next-line:no-console
        console.log(`updated ${filePath} in ${duration}ms`)
      } else {
        this.cleaner.processOne('copy-static')
      }
    })
  }

  private registerFileRemovedEvents() {
    this.watcher!.on('unlink', async (filePath: string) => {
      const timeStart = new Date().getTime()
      if (/tsx?$/.test(filePath)) {
        this.compiler.remove(filePath)
        const srcFolder = path.join(this.srcFolder, 'src')
        const from = path.resolve(path.join(filePath))
        const fragment = path.relative(srcFolder, from).replace(/tsx?$/, 'js')
        const to = path.resolve(path.join(this.srcFolder, 'dist', fragment))
        await new FS.DeleteFile(to).execute()
        await this.generator.processAll()
        if (filePath.startsWith(path.join(this.srcFolder, 'src', 'pages'))) {
          this.bundler.remove(filePath)
        }
        await this.bundler.processPages()
        const duration = new Date().getTime() - timeStart
        // tslint:disable-next-line:no-console
        console.log(`removed ${filePath} in ${duration}ms`)
      } else {
        this.cleaner.processOne('copy-static')
      }
    })
  }
}

import { FS } from '@seagull/commands-fs'
import { S3 } from '@seagull/mock-s3'
import * as chokidar from 'chokidar'
import * as path from 'path'
import * as stoppable from 'stoppable'
import { Options } from './options'
import { Bundler, Cleaner, Compiler, Generator } from './services'

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
  props: Options

  // internal worker services
  private watcher: chokidar.FSWatcher | undefined
  private cleaner: Cleaner
  private compiler: Compiler
  private generator: Generator
  private bundler: Bundler
  private server: any

  /**
   * initialize the Observer with configuration
   */
  constructor(srcFolder: string, props?: Options) {
    this.srcFolder = path.resolve(srcFolder)
    this.props = props || {}
    this.cleaner = new Cleaner(this.srcFolder)
    this.compiler = new Compiler(this.srcFolder)
    this.generator = new Generator(this.srcFolder)
    this.bundler = new Bundler(this.srcFolder, this.props.vendor)
    this.shim()
  }

  /**
   * enable redirection of used AWS resources for local development flow
   */
  shim() {
    const folder = this.props.dataPath
    const dataPath = folder ? path.join(this.srcFolder, folder) : undefined
    new S3(dataPath).activate()
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
    this.restartAppServer()
  }

  async stop() {
    this.stopAppServer()
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
        await this.restartAppServer()
      } else {
        await this.cleaner.processOne('copy-static')
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
        this.bustRequireCache(filePath)
        await this.restartAppServer()
      } else {
        await this.cleaner.processOne('copy-static')
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
        await this.restartAppServer()
      } else {
        await this.cleaner.processOne('copy-static')
      }
    })
  }

  private async restartAppServer() {
    await this.stopAppServer()
    await this.startAppServer()
  }

  private async startAppServer() {
    const entry = path.join(this.srcFolder, 'dist', 'app.js')
    delete require.cache[entry]
    const app = require(entry).default
    const port = this.props.port || 8080
    this.server = stoppable(app, 0).listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`started on localhost:${port}`)
    })
  }

  private async stopAppServer() {
    return this.server && this.server.close()
  }

  private bustRequireCache(sourceFilePath: string) {
    const srcFolder = path.join(this.srcFolder, 'src')
    const from = path.resolve(path.join(sourceFilePath))
    const fragment = path.relative(srcFolder, from).replace(/tsx?$/, 'js')
    const to = path.resolve(path.join(this.srcFolder, 'dist', fragment))
    delete require.cache[to]
  }
}

/** @module Tools */
import * as fs from 'fs'
import * as http from 'http'
import * as log from 'npmlog'
import { join } from 'path'
import { IWorker } from './interface'

export type HTTPServerMode = 'static' | 'feathers'

/**
 * A local http server, serving a statically compiled app.
 */
export class HTTPServer implements IWorker {
  private mode: HTTPServerMode
  private port: number
  private server: http.Server | undefined

  constructor(public srcFolder: string, mode?: HTTPServerMode, port?: number) {
    this.mode = mode || 'static'
    this.port = port || 8080
  }

  async onFileEvent(filePath: string) {
    await this.restart()
    log.info('[HTTPServer]', `restarted, ready on port: ${this.port}`)
  }

  async watcherDidStart() {
    await this.start()
    log.info('[HTTPServer]', `ready on port: ${this.port}`)
  }

  async restart() {
    if (this.server && this.server!.listening) {
      await this.stop()
      await this.start()
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.boot()
      this.server.listen(this.port, resolve)
    })
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.server!.close(() => resolve())
    })
  }

  private boot() {
    return http.createServer(async (req, res) => {
      let result: string
      try {
        result = await this.handleStaticApp(req)
      } catch (error) {
        result = JSON.stringify(error, null, 2)
      }
      res.write(result)
      res.end()
    })
  }

  private async handleStaticApp(req: http.IncomingMessage) {
    const url = req.url || ''
    const filePath = join(this.srcFolder, '.seagull/', url)
    if (url && url !== '/' && fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8')
    } else {
      const indexFilePath = join(this.srcFolder, '.seagull/index.html')
      return fs.readFileSync(indexFilePath, 'utf-8')
    }
  }

  private async handleFeathersApp(req: http.IncomingMessage) {
    const atoms = [] // todo: read list from disk, display this
    return 'hello feathers!'
  }
}

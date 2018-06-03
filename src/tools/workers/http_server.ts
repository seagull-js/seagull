/** @module Tools */
import * as http from 'http'
import * as log from 'npmlog'
import { IWorker } from './interface'

/**
 * A local http server, currently only somewhat mocked and without much purpose.
 */
export class HTTPServer implements IWorker {
  private server: http.Server | undefined

  constructor(public srcFolder: string, public port: number = 8080) {}

  async onFileEvent(filePath: string) {
    await this.restart()
  }

  async watcherDidStart() {
    await this.start()
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
      this.server.listen(this.port, () => {
        const message = `dev server started on port: ${this.port}`
        // tslint:disable-next-line:no-console
        log.info('', message)
        resolve()
      })
    })
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.server!.close(() => resolve())
    })
  }

  private boot() {
    return http.createServer(async (req, res) => {
      res.write('hello seagull!')
      res.end()
    })
  }
}

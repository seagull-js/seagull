/** @module Tools */
import * as http from 'http'

export default class Server {
  readonly port: number
  readonly server: http.Server

  constructor(port: number = 8080) {
    this.port = port
    this.server = this.boot()
    this.bindToPort()
  }

  private boot() {
    return http.createServer(async (req, res) => {
      res.write('hello seagull!')
      res.end()
    })
  }

  private bindToPort() {
    const message = `dev server started on port: ${this.port}`
    // tslint:disable-next-line:no-console
    const onReady = () => console.log(message)
    this.server.listen(this.port, onReady)
  }
}

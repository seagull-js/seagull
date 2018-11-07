import * as log from 'npmlog'
import { Writable } from 'stream'

export class Stash extends Writable {
  buffer: log.MessageObject[] = []

  constructor() {
    super({ objectMode: true })
  }

  _write(msg: log.MessageObject, encoding: any, callback: any): void {
    this.buffer.push(msg)
    callback()
  }
}

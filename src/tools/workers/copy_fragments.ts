/** @module Tools */
import * as cnm from 'copy-node-modules'
import * as log from 'npmlog'
import { join } from 'path'
import { IWorker } from './interface'

/**
 * Generate a basic index.html file for a "dumb" single-page-app webserver that
 * does not need SSR at all.
 */
export class CopyFragments implements IWorker {
  constructor(public srcFolder: string) {}

  async watcherWillStart() {
    const to = join(this.srcFolder, '.seagull')
    const startTime = new Date().getTime()
    await new Promise(done =>
      cnm(this.srcFolder, to, () => {
        const duration = new Date().getTime() - startTime
        log.info('[fragments]', `prepared dependencies: ${duration}ms`)
        done()
      })
    )
  }
}

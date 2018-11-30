import { Mock } from '@seagull/mock'
import * as MockFS from 'mock-fs'

/**
 * when activated, redirect all calls of node.js' 'fs' module to a virtual
 * file path in-memory.
 */
export class FS implements Mock {
  /**
   * where to proxy read/write events to on disk instead of actual S3
   */
  fakeFolderPath: string

  /**
   * create a new instance
   */
  constructor(path: string) {
    this.fakeFolderPath = path
  }

  /**
   * redirect S3 interactions to local folder
   */
  activate = () => {
    MockFS({ [this.fakeFolderPath]: {} })
  }

  /**
   * restore original S3 behavior
   */
  deactivate = () => {
    MockFS.restore()
  }
}

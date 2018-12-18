import { Mock } from '@seagull/mock'
import * as MockFS from 'mock-fs'

/**
 * when activated, redirect all calls of node.js' 'fs' module to a virtual
 * file path in-memory.
 */
export class FS implements Mock {
  /**
   * where to proxy read/write events into memory instead of actual FS
   */
  fakeFolderPath: string

  /**
   * create a new instance
   */
  constructor(path: string) {
    this.fakeFolderPath = path
  }

  /**
   * redirect FS interactions to local folder
   */
  activate = () => {
    MockFS({ [this.fakeFolderPath]: {} })
  }

  /**
   * restore original FS behavior
   */
  deactivate = () => {
    // TODO: this also deletes the current mocked file system...
    MockFS.restore()
  }

  /**
   * resets mocked fs
   */
  reset = () => {
    MockFS.restore()
    MockFS({ [this.fakeFolderPath]: {} })
  }
}

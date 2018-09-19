import * as MockFS from 'mock-fs'
import { Mock } from '../patterns'

/**
 * when activated, redirect all calls from the AWS SDK of S3 to the S3 shim
 * implementation, which operates on a local folder instead.
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

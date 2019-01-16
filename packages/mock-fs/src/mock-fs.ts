import { Mock } from '@seagull/mock'
import { noop } from 'lodash'
import { createFsFromVolume, fs as memfs, Volume } from 'memfs'

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
   * exposed fs mock
   */
  fs!: typeof memfs

  /**
   * internal fs volume
   */
  private volume!: InstanceType<typeof Volume>

  /**
   * create a new instance
   */
  constructor(path: string) {
    this.fakeFolderPath = path
    this.init()
  }

  /**
   * redirect FS interactions to local folder
   */
  activate = () => {
    throw new Error(
      'Not implemented, well no efficent way to build it in a good way.'
    )
  }

  /**
   * restore original FS behavior
   */
  deactivate = () => {
    throw new Error(
      'Not implemented, well no efficent way to build it in a good way.'
    )
  }

  /**
   * resets mocked fs
   */
  reset = () => {
    const path = this.fakeFolderPath
    this.volume.reset()
    this.volume.mkdirSync(path, { recursive: true })
  }

  /**
   * creates fs like mock object
   */
  private init() {
    this.volume = new Volume()
    this.fs = createFsFromVolume(this.volume)
    this.reset()
  }
}

/** @module Deploy */
import { join } from 'path'
import { Watcher } from '../tools/'

/**
 * Base class of the "Command Pattern" for a deployment process.
 */
export abstract class DeployCommand {
  /**
   * path to the application root
   */
  srcFolder: string

  /**
   * path to the build folder ('.seagull') within `srcFolder`
   */
  tmpFolder: string

  /**
   * initialize the DeployCommand, doing some preparation grunt work
   *
   */
  constructor(srcFolder: string) {
    this.srcFolder = srcFolder
    this.tmpFolder = join(srcFolder, '.seagull')
  }

  /**
   * Build the app fresh from scratch and the run the [[execute]] method
   */
  async run(): Promise<void> {
    const watcher = new Watcher(this.srcFolder)
    await watcher.triggerPreWatchingHook()
    await this.execute()
  }

  /**
   * implement this with the actual deploy logic. will be called after
   * `prepare()` within the `run()` command.
   */
  protected abstract async execute(): Promise<void>
}

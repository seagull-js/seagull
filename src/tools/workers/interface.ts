/** @module Tools */

/**
 * Interface Contract for any code that ought to do some work on code folder
 * watch events.
 * The [[Watcher]] will invoke all Workers registered to it on every event in
 * the order thy were registered.
 * The lifecycle events which might occur are the following:
 *
 * - [[watcherWillStart]]
 * - [[watcherDidStart]]
 * - [[onFileCreated]] / [[onFileChanged]] / [[onFileRemoved]]
 * - [[watcherWillStop]]
 * - [[watcherDidStop]]
 *
 * While it is absolutely possible to create every hook with individual code,
 * there is also a shorthand [[onFileEvent]] which will be triggered on all
 * three file event types, but only if the exact file event type isn't declared
 * explicitly.
 *
 * example code for creating a Worker:
 * ```typescript
 * export class EventLogger implements Worker {
 *   onFileEvent(filePath: string) {
 *     console.log(`file changed: ${filePath}`)
 *   }
 * }
 * ```
 */
export interface IWorker {
  /**
   * every worker must have access to the actual project folder path to make
   * sense of the file events that might occur.
   * Typically, it will be passed into the Worker's constructor when executing
   * a "strategy".
   */
  srcFolder: string

  /**
   * Invoked after the [[Watcher]] did start and the user created a new file
   */
  onFileCreated?: (filePath: string) => Promise<void>

  /**
   * Invoked after the [[Watcher]] did start and the user modified a file
   */
  onFileChanged?: (filePath: string) => Promise<void>

  /**
   * Invoked after the [[Watcher]] did start and the user deleted a file
   */
  onFileRemoved?: (filePath: string) => Promise<void>

  /**
   * Invoked on any [[onFileCreated]]/[[onFileChanged]]/[[onFileRemoved]] events
   * from the watcher, but only if the more specific event handler is NOT
   * implemented.
   */
  onFileEvent?: (filePath: string) => Promise<void>

  /**
   * Invoked before the [[Watcher]] starts watching the project or might be
   * invoked standalone to do some bulk work, like prerendering HTML pages once.
   */
  watcherWillStart?: () => Promise<void>

  /**
   * Invoked after the [[Watcher]] booted up successfully and started watching
   * files. Can be used in creative ways in the future. :)
   */
  watcherDidStart?: () => Promise<void>

  /**
   * Invoked right before the [[Watcher]] will stop watching files because he
   * was shut down programmatically.
   * Currently it does NOT fire when the user
   * directly kills the node process with `CTRL+C`.
   */
  watcherWillStop?: () => Promise<void>

  /**
   * Invoked after the [[Watcher]] stopped watching files when he was shut down
   * programmatically.
   * Currently it does NOT fire when the user
   * directly kills the node process with `CTRL+C`.
   */
  watcherDidStop?: () => Promise<void>
}

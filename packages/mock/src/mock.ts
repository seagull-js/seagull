/**
 * The basic interface for implementing the Mock Object Pattern. Use this to
 * virtualize real world interactions, like database calls or the file system.
 */
export interface Mock {
  /**
   * Activate the Mock, so subsequent code runs against a fake implementation
   */
  activate: () => any

  /**
   * Deactivate the Mock, so subsequent code runs as usual
   */
  deactivate: () => any

  /**
   * A Mock should be able to resets its internal state to its starting point without deactivating the mock
   */
  reset: () => any
}

/**
 * Basic error \
 * _shorthand for creating named JS errors_
 */
export class BasicError extends Error {
  /**
   * Creates a new basic error.
   * @param name A name for the type of error. Should be different to JS default errors.
   * @param message A human-readable description of the error.
   */
  constructor(
    /**
     * A name for the type of the error. Should be different to JS default errors.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
     */
    name: string,
    /**
     * A human-readable description of the error.
     */
    message: string
  ) {
    super(message)
    this.name = name
  }
}

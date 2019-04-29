export class BasicError extends Error {
  constructor(
    /**
     * Define a name for the type of error. Should be different to JS default errors.
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

/**
 * The Basic interface for implementing the Command-Pattern. Commands are
 * responsible for performing code with side-effects. Benefits over raw
 * functions are: explicit support for undoing things and simple queueing
 * of mulitple commands.
 *
 * All Parameters shall be passed in during initialization of the object but
 * never directly on the [[execute]] or [[revert]] methods.
 */
export interface Command {
  /**
   * put your actual code here to produce a side-effect
   */
  execute(): Promise<any>

  /**
   * put code here that un-does what your [[execute]] method produces
   */
  revert(): Promise<any>
}

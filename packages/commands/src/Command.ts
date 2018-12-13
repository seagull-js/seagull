import { Mode } from '@seagull/mode'
/**
 * The Basic interface for implementing the Command-Pattern. Commands are
 * responsible for performing code with side-effects. Benefits over raw
 * functions are: explicit support for undoing things and simple queueing
 * of mulitple commands.
 *
 * All Parameters shall be passed in during initialization of the object but
 * never directly on the [[execute]] or [[revert]] methods.
 */
export abstract class Command<
  Result = any,
  Handler extends () => any = () => Promise<Result>
> {
  /**
   * The mode the command runs in, defaults to the global singleton
   */
  mode = Mode

  /**
   * Users of this command will call this method so put your side effects implementation here. Provided a implementation for all modes exist this could be just: return this.executeHandler()
   *
   */
  abstract execute(): ReturnType<Handler>

  /**
   * put code here that un-does what your [[execute]] method produces
   */
  abstract revert(): ReturnType<Handler>

  /**
   * Edge-Mode specific execute implementation for this command
   */
  protected executeEdge?(): ReturnType<Handler>

  /**
   * Pure-Mode specific execute implementation for this command
   */
  protected executePure?(): ReturnType<Handler>

  /**
   * Connected-Mode specific execute implementation for this command
   */
  protected executeConnected?(): ReturnType<Handler>

  /**
   * Cloud-Mode specific execute implementation for this command
   */
  protected executeCloud?(): ReturnType<Handler>

  /**
   * Edge-Mode specific revert implementation for this command
   */
  protected revertEdge?(): ReturnType<Handler>

  /**
   * Pure-Mode specific revert implementation for this command
   */
  protected revertPure?(): ReturnType<Handler>

  /**
   * Connected-Mode specific revert implementation for this command
   */
  protected revertConnected?(): ReturnType<Handler>

  /**
   * Cloud-Mode specific revert implementation for this command
   */
  protected revertCloud?(): ReturnType<Handler>

  /**
   * Helper which holds the concrete execute implementation you need to call depending on the current mode.
   */
  protected get executeHandler() {
    const handerLookup = {
      cloud: this.executeCloud,
      connected: this.executeConnected,
      edge: this.executeEdge,
      pure: this.executePure,
    }
    return handerLookup[this.mode.environment]!.bind(this) as Handler
  }

  /**
   * Helper which holds the concrete revert implementation you need to call depending on the current mode.
   */
  protected get revertHandler() {
    const handerLookup = {
      cloud: this.revertCloud,
      connected: this.revertConnected,
      edge: this.revertEdge,
      pure: this.revertPure,
    }
    return handerLookup[this.mode.environment]!.bind(this) as Handler
  }
}

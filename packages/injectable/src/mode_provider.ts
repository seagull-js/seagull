import { Environments, Mode } from '@seagull/mode'
import { ClassProvider, Type } from 'injection-js'

export type ModeProviders<T> = { [environment in Environments]: Type<T> }
/**
 * The Basic interface for implementing the Command-Pattern. Commands are
 * responsible for performing code with side-effects. Benefits over raw
 * functions are: explicit support for undoing things and simple queueing
 * of mulitple commands.
 *
 * All Parameters shall be passed in during initialization of the object but
 * never directly on the [[execute]] or [[revert]] methods.
 */
export const createModeProvider = <T>(
  modeProviders: ModeProviders<T>
): ClassProvider => ({
  provide: modeProviders.cloud,
  useClass: modeProviders[Mode.environment],
})

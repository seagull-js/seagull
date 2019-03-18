import { Environments, Mode } from '@seagull/mode'
import { ClassProvider, Type } from 'injection-js'

/**
 * Dictionary listing injection-js providers for all seagull mode environments.
 */
export type ModeProviders<T> = { [environment in Environments]: Type<T> }

/**
 * Creates an injection class provider depending on the current seagull mode
 * environment.
 * @param modeProviders ModeProviders dictionary.
 */
export const createModeProvider = <T>(
  modeProviders: ModeProviders<T>
): ClassProvider => ({
  provide: modeProviders.cloud,
  useClass: modeProviders[Mode.environment],
})

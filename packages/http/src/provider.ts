import { Mode } from '@seagull/mode'
import { modes } from './modes'
import { Http } from './modes/cloud'

/**
 * Http mode injectable provider.
 */
const httpModeFactory = (): typeof Http => {
  return modes[Mode.environment]
}

export const httpModeProvider = {
  provide: Http,
  useFactory: httpModeFactory,
}

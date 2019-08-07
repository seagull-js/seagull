import { BasicError } from '@seagull/libraries'
import { FixtureStorage } from './fixture-storage'

export class SeedError extends BasicError {
  /**
   * Creates a new seed error
   * @param message human readable error message
   * @param details fixture storage or inner error object
   */
  constructor(message: string, public details?: FixtureStorage<any> | Error) {
    super('SeedError', message)
  }
}

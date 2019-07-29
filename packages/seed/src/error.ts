import { BasicError } from '@seagull/libraries'
import { FixtureStorage } from './fixtureStorage'

export class SeedError extends BasicError {
  /**
   * Creates a new seed error
   * @param message human readable error message
   * @param seed inner error or error details
   */
  constructor(message: string, public seed: FixtureStorage<any> | any) {
    super('SeedError', message)
  }
}

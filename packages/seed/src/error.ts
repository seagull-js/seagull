import { BasicError } from '@seagull/libraries'
import { FixtureStorage } from './fixtureStorage'

export class SeedError extends BasicError {
  constructor(message: string, public seed: FixtureStorage<any> | any) {
    super('SeedError', message)
  }
}

import { Seed } from '@seagull/http'

export default {
  expiresInDays: 0,
  hook: (fixture: Seed.Fixture<any>) => {
    return 'asdf'
  },
} as Seed.LocalConfig<any>

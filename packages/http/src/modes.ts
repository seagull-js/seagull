import { Http } from './modes/cloud'
import { HttpPure } from './modes/pure'
import { HttpSeed } from './modes/seed'

export const modes = {
  cloud: Http,
  connected: Http,
  edge: Http,
  pure: HttpPure,
  seed: HttpSeed,
}

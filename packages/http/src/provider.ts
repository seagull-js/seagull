import { HttpPure, HttpSeed } from '.'
import { createModeProvider } from '../../injectable/src'
import { IHttp } from './http'
import { Http } from './modes/cloud'

export const seed = false

export const provider = createModeProvider<IHttp>({
  cloud: Http,
  connected: Http,
  edge: Http,
  pure: seed ? HttpPure : HttpSeed, // TODO: is seed a new mode?
})

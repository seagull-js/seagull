export { RequestInitBase, RequestInitGet } from './interface'
export { RequestInit, Response } from 'node-fetch'

export { config as httpConfig } from './config'

// injection container module
export { module as httpDiModule } from './module'

// content-type clients (convinience adapters)
export { HttpJson } from './content-type/http_json'

// http injectables
export { Http } from './modes/cloud'
export { HttpPure } from './modes/pure'
export { HttpSeed } from './modes/seed'

export { LocalConfig } from './seed/localConfig'

import { Fixture as FixtureBase } from './seed/fixture'
import { LocalConfig as LocalConfigBase } from './seed/localConfig'

// tslint:disable-next-line:no-namespace
export namespace Seed {
  // tslint:disable-next-line:no-empty-interface
  export interface Fixture<T> extends FixtureBase<T> {}
  export interface LocalConfig<T> extends LocalConfigBase<T> {}
}

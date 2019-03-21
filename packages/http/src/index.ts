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

// TODO: move global scope when implemented in s3
export { SeedLocalConfig } from './seed/seedLocalConfig'

export { RequestInitBase, RequestInitGet } from './interface'
export { RequestInit, Response } from 'node-fetch'

export { config } from './config'

// injection container module
export { containerModule } from './containerModule'

// content-type clients (convinience adapters)
export { HttpJson } from './content-type/http_json'

// http injectables
export { Http } from './modes/cloud'
export { HttpPure } from './modes/pure'
export { HttpSeed } from './modes/seed'

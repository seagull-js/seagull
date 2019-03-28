export { RequestInitBase, RequestInitGet } from './interface'
export { RequestInit, Response } from 'node-fetch'

export { config as httpConfig } from './config'

// injection container module
export { module as httpDiModule } from './module'

// content-type clients (convinience adapters)
export { HttpJson } from './content-type/http_json'

// http injectables
export { Http } from './mode/cloud'
export { HttpPure } from './mode/pure'
export { HttpSeed } from './mode/seed'

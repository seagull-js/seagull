import { Http } from './mode/cloud'

// types
export { RequestInitBase, RequestInitGet } from './interface'
export { RequestInit, Response } from 'node-fetch'
export { HttpError } from './typings/http_error'

// services
export { Http }
export { Http as HttpCloud }
export { HttpPure } from './mode/pure'
export { HttpSeed } from './mode/seed'

// content-type services
export { HttpJson } from './content-type/http_json'

// service container modules
export { module as httpDiModule } from './module' // TODO: obsolete
export { module as httpServicesModule } from './module'

// fixture
export { Fixture as HttpFixture } from './seed/fixture'

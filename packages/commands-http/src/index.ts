import { fetchPureSeed, Request } from './request'
import { seedGlobalHookScript } from './seedGlobalHookScript'

export { SeedLocalConfig } from './seedLocalConfig'
export { RequestConfig } from './requestConfig'
export { Request } from './request'

export const Http = {
  Request,
  fetchPureSeed,
  seedGlobalHookScript,
}

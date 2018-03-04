// context detection
const hasWindow = typeof window !== 'undefined'
export const isClient = hasWindow
export const isServer = !hasWindow

// history (context-dependant)
import { createBrowserHistory, createMemoryHistory, History } from 'history'
export const history = isClient ? createBrowserHistory() : createMemoryHistory()
export const deepFreeze = function deepFreezeFunction(obj) {
  const propNames = Object.getOwnPropertyNames(obj)

  propNames.forEach(name => {
    const prop = obj[name]

    if (typeof prop === 'object' && prop !== null) {
      deepFreezeFunction(prop)
    }
  })

  return Object.freeze(obj)
}
export interface IConfig {
  domains?: string[]
  faviconFiles?: string[]
  analytics?: {
    enabled?: boolean
    ga?: string
  }
}
export const loadConfig = (): IConfig => {
  function requireConfig() {
    if (
      process &&
      process.env &&
      process.env.LAMBDA_TASK_ROOT &&
      process.env.AWS_EXECUTION_ENV
    ) {
      return require('/var/task/package.json')
    }
    if (process && process.env && process.env.NODE_ENV === 'test') {
      return require('../../../../../__tmp__/.seagull/package.json')
    }
    return require('../../../../../.seagull/package.json')
  }
  if (process && process.env && process.env.config_mock) {
    return JSON.parse(process.env.config_mock)
  }

  const conf: { seagull: IConfig } = requireConfig()
  return conf && conf.seagull ? conf.seagull : {}
}

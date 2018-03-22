import { Config, PackageJson } from '@seagull/package-config'

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

export const loadConfig = (): Config =>
  require('fs') ? new PackageJson().config : null

import { Config, PackageJson } from '@seagull/package-config'
import { Memoize } from 'typescript-memoize'

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

/**
 * ## ReadOnlyConfig class
 * ReadOnlyConfig is a utility class for use during runtime of the seagull application.
 * This assumption enables caching of the config which should not change during runtime. Thus subsequent access does not include file system access.
 * For testing purposes you can write into the returned reference and change the config. Usage of this behavior in production is discouraged.
 */
export class ReadOnlyConfig {
  /**
   * Returns the projekt name of the package.json
   */
  static get pkgName() {
    return ReadOnlyConfig.loadPkg().name
  }

  /**
   * Returns a reference to the seagull config object.
   */
  static get config() {
    return ReadOnlyConfig.loadPkg().config
  }

  /**
   * Private method to load the PackageJson.
   */
  @Memoize()
  private static loadPkg() {
    return require('fs') ? new PackageJson() : null
  }
}

import { memoize } from 'lodash'

/**
 * Basic Building Block to aggregate pure functions into a class with static
 * methods. The majority of your business logic should reside within Library
 * classes.
 * Static function have advantages over free first-class functions
 * because they can be decorated for optimizations like memoization.
 */
export class Library {
  /**
   * Decorator to cache function call results. Uses lodash's `memoize` function
   * under the hood. By default, the cache key will be the first function
   * argument of your function. If you want to change this behavior, pass
   * in the [[resolver]] function for yourself. See the
   * [lodash docs](https://lodash.com/docs#memoize) for more info.
   */
  static memoize(resolver?: () => any) {
    return (target: any, functionName: string) => {
      target[functionName] = memoize(target[functionName], resolver)
    }
  }
}

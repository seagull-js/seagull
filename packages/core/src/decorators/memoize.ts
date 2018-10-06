import { memoize as memo } from 'lodash'

export function memoize(resolver?: () => any) {
  return (target: any, functionName: string) => {
    target[functionName] = memo(target[functionName], resolver)
  }
}

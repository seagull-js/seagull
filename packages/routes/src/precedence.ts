import { Route } from './Route'

const sortPathSegment = (a?: string, b?: string) => {
  if (a === undefined && b === undefined) {
    return 0
  }
  if (a === undefined) {
    return -1
  }
  if (b === undefined) {
    return 1
  }
  if (a === '' && b === '') {
    return 0
  }

  if (a[0] === ':' && b[0] === ':') {
    return 0
  }
  if (a[0] === '*' && b[0] === '*') {
    return 0
  }

  if (a === '') {
    return -1
  }
  if (b === '') {
    return 1
  }
  if (a[0] !== ':' && a[0] !== '*' && b[0] !== ':' && b[0] !== '*') {
    return 0
  }
  if (a[0] !== ':' && a[0] !== '*') {
    return -1
  }
  if (b[0] !== ':' && b[0] !== '*') {
    return 1
  }
  if (a[0] === ':') {
    return -1
  }
  if (b[0] === ':') {
    return 1
  }
  if (a === '*') {
    return -1
  }
  if (b === '*') {
    return 1
  }
  return 0
}
export const sortByPrecedence = (routes: Array<typeof Route>) => {
  const r = routes.sort((a, b) => {
    const aa = a.path.split('/').reverse()
    const bb = b.path.split('/').reverse()
    let result = 0
    while (result === 0) {
      const cA = aa.pop()
      const cB = bb.pop()
      result = sortPathSegment(cA, cB)
      if (cA === undefined && cB === undefined) {
        break
      }
    }
    return result
  })

  return r
}

import { Route } from './Route'

const pairsFromArrays = <T>(a: T[], b: T[]) => {
  const longerArray = a.length > b.length ? a : b
  return Array.from(longerArray, (_, i) => [a[i], b[i]])
}

const isUndefined = (a?: string) => a === undefined
const isEmpty = (a?: string) => a === ''
const isConstant = (a?: string) => !!a && a[0] !== ':' && a[0] !== '*'
const isPathParam = (a?: string) => !!a && a[0] === ':'
const isWildcard = (a?: string) => !!a && a[0] === '*'

const pathPrecedence = [
  isUndefined,
  isEmpty,
  isConstant,
  isPathParam,
  isWildcard,
]

const precedenceForSegment = (a?: string, b?: string) => {
  const priorityA = pathPrecedence.map(test => test(a)).indexOf(true)
  const priorityB = pathPrecedence.map(test => test(b)).indexOf(true)
  return priorityA === priorityB ? 0 : priorityA < priorityB ? -1 : 1
}

const routeSort = (a: typeof Route, b: typeof Route) => {
  const segmentPairs = pairsFromArrays(a.path.split('/'), b.path.split('/'))
  const precedences = segmentPairs.map(pair => precedenceForSegment(...pair))
  return precedences.find(p => p !== 0) || 0
}

export const sortByPrecedence = (routes: Array<typeof Route>) =>
  routes.sort(routeSort)

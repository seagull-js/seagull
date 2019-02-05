import { Route } from './Route'

type SegmentTest = (a?: string) => boolean
const isUndefined = (a?: string) => a === undefined
const isEmpty = (a?: string) => a === ''
const isConstant = (a?: string) => !!a && a[0] !== ':' && a[0] !== '*'
const isPathParam = (a?: string) => !!a && a[0] === ':'
const isWildcard = (a?: string) => !!a && a[0] === '*'

const sortPathSegment = (a?: string, b?: string) => {
  const precedenceList: SegmentTest[] = [
    isUndefined,
    isEmpty,
    isConstant,
    isPathParam,
    isWildcard,
  ]

  const priorityA = precedenceList.map(test => test(a)).indexOf(true)
  const priorityB = precedenceList.map(test => test(b)).indexOf(true)
  return priorityA === priorityB ? 0 : priorityA < priorityB ? -1 : 1
}

export const sortByPrecedence = (routes: Array<typeof Route>) => {
  const r = routes.sort((a, b) => {
    const segmentsA = a.path.split('/')
    const segmentsB = b.path.split('/')

    let result = 0
    while (result === 0) {
      const cA = segmentsA.shift()
      const cB = segmentsB.shift()
      result = sortPathSegment(cA, cB)
      if (cA === undefined && cB === undefined) {
        break
      }
    }
    return result
  })

  return r
}

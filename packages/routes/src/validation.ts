import { Route } from './Route'

export const routeIsValid = <T extends typeof Route>(route: T) =>
  pathIsValid(route.path)

// Validates paths like defined in Route
export const pathIsValid = (path: string) =>
  !!path.match(/^[^\*]*(\/\*)?$/) &&
  !!path.match(/^\/.*/) &&
  !path.includes('?') &&
  !path.includes('+') &&
  !path.includes('(') &&
  !path.includes(')') &&
  !path.includes('//') &&
  !path.includes('**') &&
  !path.match(/[^\/]:/)

import { Route, RouteContext } from '@seagull/routes'

export default class PageRoute extends Route {
  static path = '/failure'
  static async handler(this: RouteContext) {
    this.error('Goodbye, cruel world.')
  }
}

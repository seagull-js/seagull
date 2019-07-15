import { Route, RouteContext } from '@seagull/routes'

export default class PageRoute extends Route {
  static path = '/error'
  static async handler(this: RouteContext) {
    this.error('Goodbye, cruel world.')
  }
}

import { Route, RouteContext } from '@seagull/routes'

export default class IndexRoute extends Route {
  static path = '/'
  static async handler(this: RouteContext) {
    this.html('hello html world')
  }
}

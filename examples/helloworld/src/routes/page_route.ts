import { Route, RouteContext } from '@seagull/routes'

export default class PageRoute extends Route {
  static method = 'get'
  static path = '/page'
  static async handler(this: RouteContext) {
    this.render('HelloPage', { name: 'John' })
  }
}

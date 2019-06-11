import { Route, RouteContext } from '@seagull/routes'

export default class PageRoute extends Route {
  static path = '/hooks'
  static async handler(this: RouteContext) {
    this.render('HooksPage', {})
  }
}

import { Route, RouteContext } from '@seagull/routes'

export default class PageRoute extends Route {
  static path = '/scripts'
  static async handler(this: RouteContext) {
    this.render('ScriptsExamplesPage', {})
  }
}

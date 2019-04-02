import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export default class Logging extends Route {
  static method: HttpMethod = 'GET'
  static path = '/logging-test'
  static async handler(this: RouteContext) {
    this.render('Logging', {})
  }
}

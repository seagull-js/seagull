import { SetMode } from '@seagull/mode'
import { Route, RouteContext } from '@seagull/routes'

export default class Logging extends Route {
  static method = 'get'
  static path = '/logging-test'
  static async handler(this: RouteContext) {
    this.render('Logging', {})
  }
}

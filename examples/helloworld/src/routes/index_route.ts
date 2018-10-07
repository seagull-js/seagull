import { Route } from '@seagull/routes'

export class IndexRoute extends Route {
  static method = 'get'
  static path = '/'
  async handler() {
    this.html('hello html world')
  }
}

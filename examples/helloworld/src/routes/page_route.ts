import { Route } from '@seagull/routes'

export class PageRoute extends Route {
  static method = 'get'
  static path = '/page'
  async handler() {
    this.render('HelloPage', { name: 'John' })
  }
}

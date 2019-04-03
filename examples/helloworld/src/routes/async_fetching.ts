import { Route, RouteContext } from '@seagull/routes'

export default class TicTacToe extends Route {
  static path = '/async-fetching'
  static async handler(this: RouteContext) {
    this.render('AsyncFetching', {
      initialData: 'this will change after you click the button above',
    })
  }
}

import { Route } from '@seagull/routes'

export default class TicTacToe extends Route {
  static method = 'get'
  static path = '/async-fetching'
  async handler() {
    this.render('AsyncFetching', {
      initialData: 'this will change after you click the button above',
    })
  }
}

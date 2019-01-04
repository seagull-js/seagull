import { Route } from '@seagull/routes'

export default class TicTacToe extends Route {
  static method = 'get'
  static path = '/async-fetching/mobx'
  async handler() {
    this.render('AsyncFetchingMobx', {
      initialData: 'this will change after you click the button above',
    })
  }
}

import { Route } from '@seagull/routes'

export class TicTacToe extends Route {
  static method = 'get'
  static path = '/games/tic-tac-toe'
  async handler() {
    this.render('TicTacToe', {})
  }
}

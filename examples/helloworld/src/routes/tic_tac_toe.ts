import { Route, RouteContext } from '@seagull/routes'

export default class TicTacToe extends Route {
  static method = 'get'
  static path = '/games/tic-tac-toe'
  static async handler(this: RouteContext) {
    this.render('TicTacToe', {})
  }
}

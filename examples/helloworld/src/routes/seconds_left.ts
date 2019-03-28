import { Route, RouteContext } from '@seagull/routes'

export default class TicTacToe extends Route {
  static path = '/seconds-left'
  static async handler(this: RouteContext) {
    this.render('SecondsLeft', {
      seconds: 15,
    })
  }
}

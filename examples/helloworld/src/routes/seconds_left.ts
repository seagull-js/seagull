import { Route } from '@seagull/routes'

export default class TicTacToe extends Route {
  static method = 'get'
  static path = '/seconds-left'
  async handler() {
    this.render('SecondsLeft', {
      seconds: 15,
    })
  }
}

import { Route, RouteContext } from '@seagull/routes'

export default class Hangman extends Route {
  static path = '/games/hangman'
  static async handler(this: RouteContext) {
    this.render('Hangman', {})
  }
}

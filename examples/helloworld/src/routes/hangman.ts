import { Route } from '@seagull/routes'

export default class Hangman extends Route {
  static method = 'get'
  static path = '/games/hangman'
  async handler() {
    this.render('Hangman', {})
  }
}

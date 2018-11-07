import { Route } from '@seagull/routes'
import { Term } from '../../items/index'

export default class extends Route {
  static method = 'post'
  static path = '/glossary/delete'

  async handler() {
    const { word } = this.request.body
    await Term.delete(word)
    this.redirect('/glossary')
  }
}

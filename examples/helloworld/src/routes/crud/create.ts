import { Route } from '@seagull/routes'
import { Term } from '../../items/index'

export default class extends Route {
  static method = 'post'
  static path = '/glossary/create'

  async handler() {
    const { word, definition } = this.request.body
    await Term.put({ id: word, definition })
    this.redirect('/glossary')
  }
}

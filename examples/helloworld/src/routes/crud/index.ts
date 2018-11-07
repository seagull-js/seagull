import { Route } from '@seagull/routes'
import { Term } from '../../items'

export default class extends Route {
  static method = 'get'
  static path = '/glossary'

  async handler() {
    const list = await Term.all()
    this.render('crud/Listing', { list })
  }
}

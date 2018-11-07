import { Route } from '@seagull/routes'
import { Term } from '../../items'

export default class extends Route {
  static method = 'get'
  static path = '/glossary/:id'

  async handler() {
    const id = decodeURIComponent(this.request.params.id)
    const item = await Term.get(id)
    this.render('crud/Details', { item })
  }
}

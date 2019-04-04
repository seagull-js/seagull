import { Route, RouteContext } from '@seagull/routes'
import { Term } from '../../items'

export default class extends Route {
  static method = 'GET' as const
  static path = '/glossary/:id'

  static async handler(this: RouteContext) {
    const id = decodeURIComponent(this.request.params.id)
    const item = await Term.get(id)
    this.render('crud/Details', { item })
  }
}

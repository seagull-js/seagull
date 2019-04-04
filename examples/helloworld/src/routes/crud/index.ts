import { Route, RouteContext } from '@seagull/routes'
import { Term } from '../../items'

export default class extends Route {
  static method = 'GET' as const
  static path = '/glossary'

  static async handler(this: RouteContext) {
    const list = await Term.all()
    this.render('crud/Listing', { list })
  }
}

import { Route, RouteContext } from '@seagull/routes'
import { Term } from '../../items'

export default class extends Route {
  static method = 'get'
  static path = '/glossary'

  static async handler(this: RouteContext) {
    const list = await Term.all()
    this.render('crud/Listing', { list })
  }
}

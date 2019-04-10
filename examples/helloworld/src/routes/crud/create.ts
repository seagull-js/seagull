import { Route, RouteContext, HttpMethod } from '@seagull/routes'
import { Term } from '../../items/index'

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/glossary/create'

  static async handler(this: RouteContext) {
    const { word, definition } = this.request.body
    await Term.put({ id: word, definition })
    this.redirect('/glossary')
  }
}

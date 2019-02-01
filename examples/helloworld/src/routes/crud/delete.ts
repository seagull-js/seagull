import { Route, RouteContext } from '@seagull/routes'
import { Term } from '../../items/index'

export default class extends Route {
  static method = 'post'
  static path = '/glossary/delete'

  static async handler(this: RouteContext) {
    const { word } = this.request.body
    await Term.delete(word)
    this.redirect('/glossary')
  }
}

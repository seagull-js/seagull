import { Item } from '@seagull/plugin-items'
import { Route, RouteContext } from '@seagull/routes'

class Todo extends Item {
  id: string

  constructor(id: string) {
    super()
    this.id = id
  }
}

export default class ItemRoute extends Route {
  static method = 'get'
  static path = '/items'
  static async handler(this: RouteContext) {
    await Todo.put({ id: 'first!' })
    const list = await Todo.all()
    this.html('items: ' + JSON.stringify(list))
  }
}

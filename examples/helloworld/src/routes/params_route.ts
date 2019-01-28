import { Route, RouteContext } from '@seagull/routes'

export default class ParamsRoute extends Route {
  static method = 'get'
  static path = '/params/:id'
  static async handler(this: RouteContext) {
    const data = {
      body: this.request.body,
      headers: this.request.headers,
      method: this.request.method,
      params: this.request.params,
      path: this.request.path,
      query: this.request.query,
    }
    this.json(data)
  }
}

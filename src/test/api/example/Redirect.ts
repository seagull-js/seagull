import { API, Request, Response } from '../../../lib'

export default class Redirect extends API {
  static method = 'GET'
  static path = '/redirect'
  async handle(request: Request): Promise<Response> {
    return this.redirect('/example')
  }
}

export const handler = () => {
  return Redirect.dispatch.bind(Redirect)
}

import { API, Request, Response } from '../../../lib'

export default class Error extends API {
  static method = 'GET'
  static path = '/error'
  async handle(request: Request): Promise<Response> {
    return this.error('fail!')
  }
}

export const handler = () => {
  return Error.dispatch.bind(Error)
}

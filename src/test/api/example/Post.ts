import { API, Request, Response } from '../../../lib'

export default class Greet extends API {
  static method = 'POST'
  static path = '/save'
  async handle(request: Request): Promise<Response> {
    // tslint:disable-next-line:no-console
    console.log(request)
    const { name } = request.body
    return this.text(`hello ${name}`)
  }
}

export const handler = () => {
  return Greet.dispatch.bind(Greet)
}

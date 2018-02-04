import { API, Request, Response } from '../../../lib'

export default class Post extends API {
  static method = 'POST'
  static path = '/save'
  async handle(request: Request): Promise<Response> {
    const { name } = request.body
    return this.text(`hello ${name}`)
  }
}

export const handler = () => {
  return Post.dispatch.bind(Post)
}

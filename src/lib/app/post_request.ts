import Request from './request'

export default class PostRequest extends Request {
  constructor(url: string, body: any) {
    super('POST', url)
    this.params.body = body // TODO: parse the body, actually
  }
}

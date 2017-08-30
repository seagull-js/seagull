import Request from './request'

export default class GetRequest extends Request {
  constructor(url: string, pattern: string) {
    super('GET', url)
    this.params.path = {} // TODO: parse with pattern
  }
}

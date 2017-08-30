import * as QueryParser from 'query-string'
import * as URL from 'url-parse'

export type HttpMethod = 'GET' | 'POST'

export interface IRequestParams {
  body?: any
  hash?: { [key: string]: string }
  path?: { [key: string]: string }
  query?: { [key: string]: string }
}

export default class Request {
  method: HttpMethod
  path: string
  url: string
  params: IRequestParams = {}

  constructor(method: HttpMethod, url: string) {
    const { pathname, query, hash } = new URL(url)
    this.method = method
    this.path = pathname
    this.url = url
    this.params.hash = QueryParser.parse(hash)
    this.params.query = QueryParser.parse(query)
  }
}

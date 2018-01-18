import { APIGatewayEvent } from 'aws-lambda'
import { merge } from 'lodash'

export type HttpMethod = 'GET' | 'POST'

export interface IDict {
  [key: string]: string
}

export default class Request {
  static fromApiGateway(event: APIGatewayEvent): Request {
    const method = (event.httpMethod as HttpMethod) || 'GET'
    const { pathParameters, queryStringParameters } = event
    const params = merge({}, pathParameters, queryStringParameters)
    const path = event.path
    if (method === 'POST') {
      const ct = event.headers['content-type']
      if (ct === 'application/x-www-form-urlencoded') {
        const body = '' // TODO
        return new Request(method, path, params, body)
      } else {
        const body = JSON.parse(event.body)
        return new Request(method, path, params, body)
      }
    } else {
      return new Request(method, path, params)
    }
  }

  readonly body: any = null
  readonly method: HttpMethod
  readonly params: IDict = {}
  readonly path: string

  constructor(method: HttpMethod, path: string, params: IDict, body?: any) {
    this.body = body
    this.method = method
    this.path = path
    this.params = params
  }
}

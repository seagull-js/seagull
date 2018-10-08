import * as httpMocks from 'node-mocks-http'
import { Route } from './route'

export type HttpMethod = 'GET' | 'POST'

export abstract class RouteTest {
  abstract route: typeof Route

  async invoke(method: HttpMethod = 'GET', path = '/', params: any = {}) {
    const request = httpMocks.createRequest({ method, url: path, params })
    const response = httpMocks.createResponse()
    const instance = new (this as any).route(request, response)
    await instance.handler(request)
    const data = response._getData()
    const code = response.statusCode
    const result = { code, data }
    return result
  }
}

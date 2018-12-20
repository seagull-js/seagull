import { BasicTest } from '@seagull/testing'
import * as httpMocks from 'node-mocks-http'
import { Route, setExpireHeader } from './Route'

export type HttpMethod = 'GET' | 'POST'

export abstract class RouteTest extends BasicTest {
  abstract route: typeof Route

  async invoke(method: HttpMethod = 'GET', path = '/', params: any = {}) {
    const request = httpMocks.createRequest({ method, url: path, params })
    const response = httpMocks.createResponse()
    setExpireHeader(response, this.route.cache)
    const instance = new (this as any).route(request, response)
    await instance.handler(request)
    const data = response._getData()
    const code = response.statusCode
    const headers = response._getHeaders()
    const result = { code, data, headers }
    return result
  }
}

import { BasicTest } from '@seagull/testing'
import * as httpMocks from 'node-mocks-http'
import { Route, setExpireHeader } from './Route'

export type HttpMethod = 'GET' | 'POST'

export abstract class RouteTest extends BasicTest {
  abstract route: typeof Route

  async invoke(method: HttpMethod = 'GET', path = '/', params: any = {}) {
    const request = httpMocks.createRequest({ method, url: path, ...params })
    const response = httpMocks.createResponse()
    await this.route.handle(request, response)
    const data = response._getData()
    const code = response.statusCode
    const headers = response._getHeaders()
    const result = { code, data, headers }
    return result
  }
}

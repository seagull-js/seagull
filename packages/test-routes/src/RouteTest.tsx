import { BasicTest } from '@seagull/testing'
import { EventEmitter } from 'events'
import { Request, Response } from 'express'
import * as httpMocks from 'node-mocks-http'
import { RouteContextMock } from './RouteContextMock'

export type HttpMethod = 'GET' | 'POST' | 'get' | 'post'
interface Connection {
  request: httpMocks.MockRequest<Request>
  response: httpMocks.MockResponse<Response>
}

export abstract class RouteTest extends BasicTest {
  abstract route: any

  /**
   * Invokes the `route` with an mocked request and an response object.
   * Waits for the request to finish and returns data from the response.
   * @param method http method
   * @param path path string the route gets called with; extracts path parameters
   * @param params Params object passed through TODO: think body vs query vs path params...
   */

  async invoke(path = '/', params: any = {}) {
    const reqRes = this.requestAndResponse(this.route.method, path, params)
    await this.executeRoute(reqRes)
    return this.gatherResponseData(reqRes.response)
  }

  /**
   * Invokes the `route` with a special mocked RouteContext.
   * Waits for the request to finish and returns data from the response.
   * Also returns the RouteContextMocked instance for introspection.
   * @param method http method
   * @param path path string the route gets called with; extracts path parameters
   * @param params Params object passed through TODO: think body vs query vs path params...
   */

  async invokeMocked(
    path = '/',
    params: any = {}
  ): Promise<RouteContextMock['results']> {
    const reqRes = this.requestAndResponse(this.route.method, path, params)
    const ctx = new RouteContextMock(reqRes.request, reqRes.response)

    await this.executeRoute(ctx)
    return ctx.results
  }

  private requestAndResponse(method: HttpMethod, path: string, params: any) {
    const request = httpMocks.createRequest({ method, url: path, ...params })
    const response = httpMocks.createResponse({ eventEmitter: EventEmitter })
    return { request, response }
  }
  private async executeRoute(ctx: Connection | RouteContextMock) {
    const { request, response } = ctx
    const responseFinished = new Promise(resolve => response.on('end', resolve))
    ctx instanceof RouteContextMock
      ? this.route.handle(ctx as any)
      : this.route.handle(request, response)
    await responseFinished
  }

  private gatherResponseData(response: Connection['response']) {
    const data = response._getData()
    const code = response.statusCode
    const headers = response._getHeaders()
    return { code, data, headers }
  }
}

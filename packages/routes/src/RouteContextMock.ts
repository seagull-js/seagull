import { PageType, render } from '@seagull/pages'
import { Request, Response } from 'express'
import * as fs from 'fs'
import { isString } from 'lodash'
import * as rfs from 'require-from-string'
import { RouteContext } from './RouteContext'

type RouteContextCalls =
  | 'text'
  | 'error'
  | 'html'
  | 'json'
  | 'missing'
  | 'redirect'
  | 'render'

/*
 * A Mock for RouteContext, does not invoke things like page rendering.
 * Just makes sure the response is "send" and saves given data for test assertions.
 */
export class RouteContextMock {
  request: Request
  response: Response

  /**
   * dumb data structure for saving the call arguments of the instance methods.
   * Using this "Mock" with Route.handle/1 it is possible to just call the Route.handler and get the results of Route.handler calling RouteContext methods
   */
  results = {
    called: null as RouteContextCalls | null,
    error: { message: undefined as string | undefined },
    html: { data: undefined as string | undefined },
    json: { data: undefined as any },
    missing: { message: undefined as string | undefined },
    redirect: {
      path: undefined as string | undefined,
      permanent: undefined as boolean | undefined,
    },
    render: {
      data: undefined as any | undefined,
      src: undefined as string | PageType | undefined,
    },
    text: { data: undefined as string | undefined },
  }

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  // returns plain text
  text(this: RouteContextMock, data: string) {
    this.results.text.data = data
    this.finishResponse('text')
  }

  // returns an error message
  error(message: string = 'internal server error') {
    this.results.error.message = message
    this.finishResponse('error')
  }

  // send response as HTML
  html(data: string) {
    this.results.html.data = data
    this.finishResponse('html')
  }

  // return data as JSON response
  json(data: any) {
    this.results.json.data = data
    this.finishResponse('json')
  }

  // send notFound error
  missing(message: string = 'not found') {
    this.results.missing.message = message
    this.finishResponse('missing')
  }

  // redirect to other path with 301 (permanent) or 302
  redirect(path: string, permanent: boolean = true) {
    this.results.redirect.path = path
    this.results.redirect.permanent = permanent
    this.finishResponse('redirect')
  }

  // render a Page with data
  render(src: string | PageType, data: any) {
    this.results.render.src = src
    this.results.render.data = data
    this.finishResponse('render')
  }

  private finishResponse(type: RouteContextCalls) {
    if (this.results.called) {
      throw new Error('Response was already finished')
    }
    this.results.called = type
    this.response.send()
  }
}

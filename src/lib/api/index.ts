import { APIGatewayEvent as Event, Callback as CB, Context } from 'aws-lambda'
import Request from './request'
import Response from './response'

/**
 * Basic class for a "Backend" API Route.
 */

export type Callback = (error: Error, data: Response) => void

export default class API {
  /**
   * Configuration for HTTP settings
   */
  // url path
  static path: string

  // specify the desired HTTP Method
  static method: string = 'GET'

  // add CORS headers and OPTIONS Request for this route
  static cors: boolean = false

  static cache: number = 0

  // more stuff here, like
  // timeout, ...

  // This will be invoked by AWS Lambda. Do not touch.
  static async dispatch(event: Event, context: Context, fn: Callback) {
    const api: API = this.create()
    let response: Response
    try {
      const request = Request.fromApiGateway(event)
      response = await api.handle(request)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log('ERROR:', error)
      response = api.error('internal server error')
    }
    response.headers['Cache-Control'] = this.cache
      ? `max-age=${this.cache}`
      : 'no-cache, no-store'
    // we dont use the error callback of lambda because that would trigger
    // the default response of API-Gateway, removing easy header control
    fn(null, response)
  }

  // convenience helper for `dispatch()`, useful for testing & devserver
  static async dispatchPromise(event: any, ctx: any) {
    return new Promise((resolve, reject) => {
      this.dispatch(event, ctx, (error, result) => {
        return error ? reject(error) : resolve(result)
      })
    })
  }

  // indirection helper for 'this' magic. Do not refactor into dispatch() above!
  static create<T extends API>(): T {
    return new this() as T
  }

  // this function contains your business logic code, will be overriden
  async handle(request: Request): Promise<Response> {
    return new Response(200, '', {})
  }

  // return data as JSON response
  json(data: any): Response {
    const headers = { 'Content-Type': 'application/json; charset=utf-8' }
    const body = JSON.stringify(data, null, 2)
    return new Response(200, body, headers)
  }

  // send response as HTML
  html(data: string): Response {
    const headers = { 'Content-Type': 'text/html; charset=utf-8' }
    return new Response(200, data, headers)
  }

  text(data: string): Response {
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' }
    return new Response(200, data, headers)
  }

  redirect(url: string, permanent: boolean = true): Response {
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      Location: url,
    }
    const data = `<html>
      <head>
        <title>Moved</title>
      </head>
      <body>
        <h1>Moved</h1>
        <p>This page has moved to <a href="${url}">${url}/</a>.</p>
      </body>
    </html>`
    const code = permanent ? 301 : 302
    return new Response(code, data, headers)
  }

  error(message: string = 'internal server error'): Response {
    const headers = { 'Content-Type': 'text/html; charset=utf-8' }
    return new Response(500, message, headers)
  }

  // show 404 error page
  missing(message: string, permanent: boolean = false): Response {
    const headers = { 'Content-Type': 'text/html; charset=utf-8' }
    const code = permanent ? 410 : 404
    return new Response(code, message, headers)
  }
}

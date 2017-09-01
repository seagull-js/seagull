import { APIGatewayEvent as Event, Callback as CB, Context } from 'aws-lambda'
import Request from './request'
import Response from './response'

/**
 * Basic class for a "Backend" API Route.
 */

export default class API {
  // This will be invoked by AWS Lambda. Do not touch.
  static async dispatch(event: Event, context: Context, fn: CB) {
    try {
      const request = Request.fromApiGateway(event)
      const handler = new this()
      const response = await handler.handle(request)
      return fn(null, response)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log('ERROR:', error)
      return fn(new Error('500'), null)
    }
  }

  // convenience helper for dispatch, useful for testing & devserver
  static async dispatchPromise(event: any, ctx: any) {
    return new Promise((resolve, reject) => {
      this.dispatch(event, ctx, (error, result) => {
        error ? reject(error) : resolve(result)
      })
    })
  }

  // url path
  path?: string

  // add CORS headers and OPTIONS Request for this route
  cors: boolean = false

  // specify the desired HTTP Method
  method: string = 'GET'

  // more stuff here, like
  // timeout, ...

  // construct the route instance
  // constructor() {
  //   const path = this.path
  // }

  // this function contains your business logic code.
  async handle(request: Request): Promise<Response> {
    return new Response(200, '', {})
  }

  // return data as JSON response
  json(data: any): Response {
    return Response.json(200, data, this.cors)
  }

  html(data: string): void {
    // send reponse as HTML
  }

  text(data: string): Response {
    return Response.text(200, data)
  }

  redirect(url: string): void {
    // redirect to target url
  }

  error(message: string): void {
    // show 500 error message
  }

  missing(message: string): void {
    // show 404 error page
  }
}

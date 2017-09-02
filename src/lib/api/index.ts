import { APIGatewayEvent as Event, Callback as CB, Context } from 'aws-lambda'
import Handler from './handler'
import Request from './request'
import Response from './response'

/**
 * Basic class for a "Backend" API Route.
 */

export type Callback = (error: Error, data: Response) => void

export default class API extends Handler {
  // This will be invoked by AWS Lambda. Do not touch.
  static async dispatch(event: Event, context: Context, fn: Callback) {
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

  // convenience helper for `dispatch()`, useful for testing & devserver
  static async dispatchPromise(event: any, ctx: any) {
    return new Promise((resolve, reject) => {
      this.dispatch(event, ctx, (error, result) => {
        return error ? reject(error) : resolve(result)
      })
    })
  }

  // this function contains your business logic code, will be overriden
  async handle(request: Request): Promise<Response> {
    return new Response(200, '', {})
  }
}

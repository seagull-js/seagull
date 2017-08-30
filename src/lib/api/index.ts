import Request from './request'
import Response from './response'

/**
 * Basic class for a "Backend" API Route.
 */

// available Http methods. NONE means private
export type METHOD = 'GET' | 'POST' | 'NONE'

export default abstract class API {
  // add CORS headers and OPTIONS request for this route
  cors: boolean = false

  // specify the desired HTTP Method
  method: METHOD = 'GET'

  // where to mount this route (the URL path)
  path?: string = '/'

  // more stuff here, like
  // timeout, ...

  // construct the route instance
  // constructor(context: any, request: any) {
  //   // extract path parameters n stuff?
  // }

  // this function contains your business logic code.
  async abstract handle(request: Request): Promise<Response>

  // return data as JSON response
  protected json(data: any): Response {
    return Response.json(200, data)
  }

  protected html(data: string): void {
    // send reponse as HTML
  }

  protected text(data: string): Response {
    return Response.text(200, data)
  }

  protected redirect(url: string): void {
    // redirect to target url
  }

  protected error(message: string): void {
    // show 500 error message
  }

  protected missing(message: string): void {
    // show 404 error page
  }
}

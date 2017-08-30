/**
 * Basic class for a "Backend" Route
 */

export type METHOD = 'GET' | 'POST'

export default class Route {
  // add CORS headers and OPTIONS request for this route
  cors: boolean = false

  // specify the desired HTTP Method
  method: METHOD = 'GET'

  // where to mount this route (the URL path)
  path: string = '/'

  // more stuff here, like
  // timeout, ...

  // construct the route instance
  // constructor(context: any, request: any) {
  //   // extract path parameters n stuff?
  // }

  handle(request: any): void {
    // this will be overridden
  }

  // return data as JSON response
  protected json(data: any): void {
    // send reponse as proper JSON
  }

  protected html(data: string): void {
    // send reponse as HTML
  }

  protected text(data: string): void {
    // send reponse as plain text
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

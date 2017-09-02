import { APIGatewayEvent as Event, Callback as CB, Context } from 'aws-lambda'
import Request from './request'
import Response from './response'

/**
 * Basic class for a "Backend" API Route.
 */

export default class Handler {
  /**
   * Configuration for HTTP settings
   */
  // url path
  static path: string

  // specify the desired HTTP Method
  static method: string = 'GET'

  // add CORS headers and OPTIONS Request for this route
  static cors: boolean = false

  // more stuff here, like
  // timeout, ...

  /**
   * instance getters for the static properties above
   */
  path(): string {
    // tslint:disable-next-line:no-string-literal
    return this.constructor['path']
  }

  method(): string {
    // tslint:disable-next-line:no-string-literal
    return this.constructor['method']
  }

  cors(): string {
    // tslint:disable-next-line:no-string-literal
    return this.constructor['cors']
  }

  /**
   * available response handlers, depending on the HTTP settings above
   */

  // return data as JSON response
  json(data: any): Response {
    const headers = { 'Content-Type': 'application/json; charset=utf-8' }
    const body = JSON.stringify(data, null, 2)
    return new Response(200, body, headers)
  }

  html(data: string): void {
    // send reponse as HTML
  }

  text(data: string): Response {
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' }
    return new Response(200, data, headers)
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

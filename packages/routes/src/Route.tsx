import { Express, Request, Response } from 'express'
import { RouteContext } from './RouteContext'

type Middleware = (ctx: RouteContext) => boolean | void

/**
 * Defines a seagull route. Set the properties to your desired values and implement static async handler.
 * Seagull automaticly picks up routes in your routes folder.
 */
export abstract class Route {
  // optional api key found in Authorization header
  static apiKey?: string
  // cache in seconds
  static cache: number = 0
  // http method
  static method: string
  // express path definition for route
  static path: string

  // implement your route here
  static handler: (this: RouteContext) => Promise<void>

  // helper for express to call this route; applies middleware
  static async handle(req: Request, res: Response) {
    const ctx = new RouteContext(req, res)
    this.pipeline.reduce(this.applyMiddleware.bind(this, ctx), false)
  }

  // registers the route with an express app
  static async register(app: Express & { [key: string]: any }) {
    const method = this.method.toLowerCase()
    app[method](this.path, this.handle.bind(this))
  }

  private static pipeline = [
    Route.setExpireHeader,
    Route.authRequest,
    Route.processRequest,
  ]

  // applies cache header
  private static setExpireHeader(ctx: RouteContext) {
    ctx.response.setHeader('cache-control', `max-age=${this.cache}`)
  }

  // checks apiKey
  private static authRequest(ctx: RouteContext) {
    const requiredHeader = this.apiKey && `Token ${this.apiKey}`
    const authHeader = ctx.request.header('Authorization')
    const isAuthed = !requiredHeader || authHeader === requiredHeader
    return isAuthed ? false : (ctx.error('Unauthed'), true)
  }

  // handles a request
  private static processRequest(ctx: RouteContext) {
    this.handler.bind(ctx)()
  }

  private static applyMiddleware(
    ctx: RouteContext,
    abort: boolean | void,
    pipelineItem: Middleware
  ) {
    return abort ? abort : pipelineItem.bind(this)(ctx)
  }
}

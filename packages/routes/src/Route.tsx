import { Express, Request, Response } from 'express'
import { RouteContext } from './RouteContext'
import { RouteContextMock } from './RouteContextMock'

type Middleware = (ctx: RouteContext) => Promise<boolean | void>

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
  /**
   * Path at which the route can be called.
   * Must start with /.
   * Must only use * wildcards at the end
   * Pathparams may start with :
   * e.g.:
   * - /this/is/a/:pathParam/path/with/a/wildcard/*
   */
  static path: string

  // implement your route here
  static handler: (this: RouteContext) => Promise<void>

  // helper for express to call this route; applies middleware
  static async handle(ctx: RouteContext): Promise<void>
  static async handle(req: Request, res: Response): Promise<void>
  static async handle(
    req: RouteContext | Request,
    res?: Response
  ): Promise<void> {
    const ctx = 'request' in req ? req : new RouteContext(req, res!)

    await this.pipeline.reduce(
      this.applyMiddleware.bind(this, ctx),
      Promise.resolve(false)
    )
  }

  // registers the route with an express app
  static register(app: Express & { [key: string]: any }) {
    const method = this.method.toLowerCase()
    app[method](this.path, this.handle.bind(this))
  }

  private static pipeline: Middleware[] = [
    Route.setExpireHeader,
    Route.authRequest,
    Route.processRequest,
  ]

  // applies cache header
  private static async setExpireHeader(ctx: RouteContext) {
    ctx.response.setHeader('cache-control', `max-age=${this.cache}`)
  }

  // checks apiKey
  private static async authRequest(ctx: RouteContext) {
    const requiredHeader = this.apiKey && `Token ${this.apiKey}`
    const authHeader = ctx.request.header('Authorization')
    const isAuthed = !requiredHeader || authHeader === requiredHeader
    return isAuthed ? false : (ctx.error('Unauthed'), true)
  }

  // handles a request
  private static async processRequest(ctx: RouteContext) {
    return this.handler.bind(ctx)()
  }

  private static async applyMiddleware(
    ctx: RouteContext,
    abort: Promise<boolean | void>,
    pipelineItem: Middleware
  ) {
    // TODO: ctx.response has intel about whether the responses "end" event got emitted. Maybe use that instead for abortion
    if (await abort) {
      return abort
    }
    return pipelineItem.bind(this)(ctx)
  }
}

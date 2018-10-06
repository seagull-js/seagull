import { Express, Request, Response } from 'express'
import * as fs from 'fs'
import { PageType } from './page'
import { render } from './render'

export abstract class Route {
  static cache: number = 0
  static method: string
  static path: string

  static async register<T extends Route>(
    this: { new (...args: any[]): T },
    app: Express
  ) {
    const method = (this as any).method.toLowerCase()
    const path = (this as any).path
    const fn = (req: Request, res: Response) => new this(req, res).handler(req)
    const router = app as any
    router[method](path, fn)
  }

  protected request: Request
  protected response: Response

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  abstract async handler(req: Request): Promise<void>

  error(message: string = 'internal server error') {
    this.response.status(500)
    this.response.send(message)
  }

  // send response as HTML
  html(data: string) {
    this.response.send(data)
  }

  // return data as JSON response
  json(data: any) {
    this.response.json(data)
  }

  // send notFound error
  missing(message: string = 'not found') {
    this.response.status(404)
    this.response.send(message)
  }

  // redirect to other path with 301 (permanent) or 302
  redirect(path: string, permanent: boolean = true) {
    const code = permanent ? 301 : 302
    this.response.redirect(code, path)
  }

  // render a Page with data
  render(pageFileName: string, data: any) {
    const pagePath = `${process.cwd()}/dist/assets/pages/${pageFileName}.js`
    const pageBlob = fs.readFileSync(pagePath, 'utf-8')
    const page = require(pagePath).default as PageType
    const html = render(pageBlob, page, data)
    this.response.send(html)
  }

  // send response as plain text
  text(data: string) {
    this.response.send(data)
  }
}

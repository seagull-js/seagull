import { PageType, render } from '@seagull/pages'
import { Express, Request, Response } from 'express'
import * as fs from 'fs'
import { isString } from 'lodash'
import * as React from 'react'
import * as rfs from 'require-from-string'

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
    this.response.type('html')
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
  render(src: string | PageType, data: any) {
    const renderer: any = isString(src) ? this.renderUMD : this.renderPage
    const html = renderer(src, data)
    this.response.type('html')
    this.response.send(html)
  }

  // send response as plain text
  text(data: string) {
    this.response.type('txt')
    this.response.send(data)
  }

  private renderUMD(pageSource: string, data: any) {
    const pagePath = `${process.cwd()}/dist/assets/pages/${pageSource}.js`
    const pageBlob = fs.readFileSync(pagePath, 'utf-8')
    const page = rfs(pageBlob).default as PageType
    return render(pageBlob, page, data)
  }

  private renderPage(pageSource: PageType, data: any) {
    return render('', pageSource, data)
  }
}

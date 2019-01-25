import { PageType, render } from '@seagull/pages'
import { Express, Request, Response } from 'express'
import * as fs from 'fs'
import { isString } from 'lodash'
import * as React from 'react'
import * as rfs from 'require-from-string'

export class RouteContext {
  request: Request
  response: Response

  constructor(request: Request, response: Response) {
    this.request = request
    this.response = response
  }

  text(this: RouteContext, data: string) {
    this.response.type('txt')
    this.response.send(data)
  }

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

  private renderUMD(pageSource: string, data: any) {
    const pagePath = `${process.cwd()}/dist/assets/pages/${pageSource}.js`
    const pagePathServer = pagePath.replace('.js', '-server.js')
    const pageBlob = fs.readFileSync(pagePath, 'utf-8')
    const pageBlobServer = fs.readFileSync(pagePathServer, 'utf-8')
    const page = rfs(pageBlobServer).default as PageType
    return render(pageBlob, page, data)
  }

  private renderPage(pageSource: PageType, data: any) {
    return render('', pageSource, data)
  }
}

export abstract class Route {
  static key?: string
  static cache: number = 0
  static method: string
  static path: string

  static handler: (this: RouteContext) => Promise<void>

  static async register(app: Express & { [key: string]: any }) {
    const method = this.method.toLowerCase()
    app[method](this.path, this.handle)
  }

  static async handle(request: Request, response: Response) {
    const ctx = new RouteContext(request, response)
    return this.handler.bind(ctx)()
  }
}

export function setExpireHeader(response: Response, cache: number) {
  response.setHeader('cache-control', `max-age=${cache}`)
}

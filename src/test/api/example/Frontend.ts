import createElement from 'inferno-create-element'
import { doAllAsyncBefore, match, RouterContext } from 'inferno-router'
import { renderToString } from 'inferno-server'

import { API, Request, Response } from '../../../lib'
import routes from './frontend/'
import layout from './frontend/layout'

export default class Frontend extends API {
  static method = 'GET'
  static path = '/'
  async handle(request: Request): Promise<Response> {
    const renderProps = match(routes, request.path)
    // TODO
    // if (renderProps.redirect) {
    //   return this.redirect(renderProps.redirect)
    // }
    const children = createElement(RouterContext, renderProps)
    const body = renderToString(layout({ children }))
    return this.html('<!DOCTYPE html>\n' + body)
  }
}

// CLI-building does this step implicitly
export const handler = () => {
  return Frontend.dispatch.bind(Frontend)
}

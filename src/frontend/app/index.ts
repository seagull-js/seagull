/** @module Frontend */
import { normalize, setupPage } from 'csstips'
import * as History from 'history'
import { noop } from 'lodash'
import * as QS from 'query-string'
import * as React from 'react'
import { render } from 'react-dom'
import { setStylesTarget } from 'typestyle'
import * as UniversalRouter from 'universal-router'
import * as generateUrls from 'universal-router/generateUrls'
import { isClient } from '../util'
import { history } from '../util'

export class App {
  history = history
  entities: { [name: string]: any } = { routes: [], stores: [] }
  private router: any

  constructor() {
    isClient ? ((window as any).app = this) : noop()
  }

  register(entity: { register: (app: App) => App }) {
    return entity.register(this)
  }

  async match(pathname: string) {
    const [path, queryString] = pathname.split('?')
    const query = QS.parse(queryString)
    return this.registry.resolve({ pathname: path.replace('.html', ''), query })
  }

  url(name: string, params?: object) {
    const stringifyQueryParams = QS.stringify
    const generate = generateUrls(this.registry, { stringifyQueryParams })
    return generate(name, params)
  }

  async mount(path?: string) {
    normalize()
    setupPage('#app')
    setStylesTarget(document.getElementById('styles-target') as any)
    await this.renderClient()
    this.history.listen((location: any) => this.renderClient())
  }

  private async renderClient() {
    const pathname = window.location.pathname + window.location.search
    const component = await this.match(pathname)
    render(component, document.querySelector('#app'))
  }

  private get registry() {
    const routes = this.entities.routes
    this.router ? noop() : (this.router = new UniversalRouter(routes))
    return this.router
  }
}

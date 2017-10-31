// library imports
import * as bulk from 'bulk-require'
import { keys, map, reduce } from 'lodash'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import * as React from 'react'
import { Route, Router, RouterProps, StaticRouter, StaticRouterProps, Switch } from 'react-router';
import Request from '../api/request'
import { history } from '../util'

declare type IRoutingConf =  { 
  appRouter: typeof Router,
  routerProps: RouterProps
} | {
  appRouter: typeof StaticRouter,
  routerProps: StaticRouterProps
}

declare type IStores = { routing: RouterStore } & {}
declare type IPages = Array<{default:any}>

export default class Routing {
  private routingConf : IRoutingConf
  private pages: IPages
  private stores: IStores

  constructor( isSSR = false, request?: Request ) {
    this.pages = this.loadPages()
    this.stores = this.loadStores()
    this.routingConf = (isSSR && request) ? this.buildStaticRoutingConf(request) : this.buildBrowserRoutingConf() 
  }

  load() {
    return (
      <Provider  { ...this.stores }>
        <this.routingConf.appRouter {...this.routingConf.routerProps}>
          <Switch>
            {map(this.pages, (page)=>{
              let path: string
              try {
                path = (new page.default.wrappedComponent()).path
              } catch (e) {
                path = (new page.default()).path
              }
              return (
                <Route exact path={path} component={ page.default } key={path}/>
              )
            })}
          </Switch>
        </this.routingConf.appRouter>
      </Provider>
    )
  }

  private buildStaticRoutingConf(request: Request): IRoutingConf {
    return {
      appRouter: StaticRouter,
      routerProps: {
        context: {},
        location: request.path
      }
    }
  }

  private buildBrowserRoutingConf(): IRoutingConf {
    const browserHistory = syncHistoryWithStore(history, this.stores.routing);    
    return {
      appRouter: Router,
      routerProps: { history: browserHistory }
    }
  }

  private loadPages(): IPages {
    try {
      return bulk(__dirname, [
       '../../../../../../dist/frontend/pages/*.js',
       ])['..']['..']['..']['..']['..']['..'].dist.frontend.pages
    } catch (e) {
      return bulk(__dirname, [
       '../../../../../../frontend/pages/*.tsx',
       ])['..']['..']['..']['..']['..']['..'].frontend.pages
    }
  }
  private loadStores(): IStores {
    let rawStores = []
    try {
      rawStores = bulk(__dirname, [
        '../../../../../../dist/frontend/stores/*.js',
      ])['..']['..']['..']['..']['..']['..'].dist.frontend.stores
    } catch (e) {
      rawStores = bulk(__dirname, [
       '../../../../../../frontend/stores/*.ts',
       ])['..']['..']['..']['..']['..']['..'].frontend.stores
    }
    return reduce(keys(rawStores), (value, storeKey)=>{
      value[storeKey] = new rawStores[storeKey].default()
      return value
    }, {
      routing: new RouterStore()
    })
  }
}
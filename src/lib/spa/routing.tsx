// library imports
import * as bulk from 'bulk-require'
import { keys, map, reduce } from 'lodash'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import * as React from 'react'
import { Route, Router, RouterProps, StaticRouter, StaticRouterProps, Switch } from 'react-router';
import Request from '../api/request'
import { history } from '../util'

// static routing or dynamic
declare type IRoutingConf =  { 
  appRouter: typeof Router,
  routerProps: RouterProps
} | {
  appRouter: typeof StaticRouter,
  routerProps: StaticRouterProps
}

// loaded stores, minimial: routing
declare type IStores = { routing: RouterStore } & {}
// should be: an array of classes which implements Page
// cant be expressed in typescript
declare type IPages = Array<{default:any}>

export default class Routing {
  private routingConf : IRoutingConf
  private pages: IPages
  private stores: IStores

  constructor( isSSR = false, request?: Request ) {
    this.pages = this.loadPages()
    this.stores = this.loadStores()
    // while ssr we use different routing classes
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
                // Page classes with injected stores
                path = (new page.default.wrappedComponent()).path
              } catch (e) {
                // raw page classes
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
      // paths for bundling after compile
      return bulk(__dirname, [
       '../../../../../../dist/frontend/pages/*.js',
       ])['..']['..']['..']['..']['..']['..'].dist.frontend.pages
    } catch (e) {
      // paths for bundling and compiling together (tsify)
      return bulk(__dirname, [
       '../../../../../../frontend/pages/*.tsx',
       ])['..']['..']['..']['..']['..']['..'].frontend.pages
    }
  }
  private loadStores(): IStores {
    let rawStores = []
    try {
      // paths for bundling after compile
      rawStores = bulk(__dirname, [
        '../../../../../../dist/frontend/stores/*.js',
      ])['..']['..']['..']['..']['..']['..'].dist.frontend.stores
    } catch (e) {
      // paths for bundling and compiling together (tsify)
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
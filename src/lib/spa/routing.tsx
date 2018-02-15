// library imports
import { keys, map, reduce, without } from 'lodash'
import { inject, observer, Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import * as React from 'react'
import { matchPath, Route, Router, RouterProps, StaticRouter, StaticRouterProps, Switch } from 'react-router';
import { matchRoutes } from 'react-router-config'
import { RouteProps } from 'react-router-dom'
import Request from '../api/request'
import { history } from '../util'
import Page from './page'

// static routing or dynamic
declare type IRoutingConf =  { 
  appRouter: typeof Router,
  routerProps: RouterProps
} | {
  appRouter: typeof StaticRouter,
  routerProps: StaticRouterProps
}

// loaded stores, minimial: routing
export type IStores = { routing: RouterStore } & {}
// should be: an array of classes which implements Page
// cant be expressed in typescript
type IPages<S, P> = Array<{default:{new():Page<S, P>}}>

export default class Routing {
  stores: IStores
  
  private routingConf : IRoutingConf
  private pages: IPages<any,any>
  private request

  constructor( isSSR = false, request?: Request ) {
    this.stores = this.loadStores()
    this.pages = this.loadPages()
    // while ssr we use different routing classes
    this.routingConf = (isSSR && request) ? this.buildStaticRoutingConf(request) : this.buildBrowserRoutingConf() 
  }

  initialMatchedPage() {
    const requestPath = (this.routingConf.routerProps as StaticRouterProps).location as string
    
    const matched = matchRoutes(this.decoratedPages(), requestPath)
    if (matched.length) {
      const page: {new(props:any):Page<any, any>} = (matched[0] as any).route.component.wrappedComponent
      return new page(this.stores)
    }
    return null
  }

  load() {
    const pages = this.decoratedPages()
    return (
      <Provider  { ...this.stores }>
        <this.routingConf.appRouter {...this.routingConf.routerProps}>
          <Switch>
            { pages.map( page => React.createElement(Route, page))}
          </Switch>
        </this.routingConf.appRouter>
      </Provider>
    )
  }

  private decoratedPages() {
    const storeKeys: string[] = without(keys(this.stores), 'routing')

    return map(this.pages, (page):RouteProps=>{
      const path: string = (new page.default()).path
      const component = inject(...storeKeys)(observer(page.default))
      const routeProp = {
        component,
        exact: true,
        key: path,
        path,
      }
      return routeProp
    })
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

  private loadPages(): IPages<any, any> {
    try {
        // paths for aws lambda
        return require('/var/task/dist/frontend/index.js').pages
    } catch(e) {
      try {
        // paths for bundling after compile
        return require('../../../../../../.seagull/dist/frontend/index.js').pages
      } catch (e) {
        // paths for faster testing (symlinked node_modules)
        return require('../../../../../../__tmp__/.seagull/dist/frontend/index.js').pages
      }
    }
  }

  private loadStores(): IStores {
    let rawStores = []
    try {
      // paths for aws lambda
      rawStores = require('/var/task/dist/frontend/index.js').stores
    } catch(e) {
      try {
        // paths for bundling after compile
        rawStores = require('../../../../../../.seagull/dist/frontend/index.js').stores
      } catch (e) {
        // paths for faster testing (symlinked node_modules)
        rawStores = require('../../../../../../__tmp__/.seagull/dist/frontend/index.js').stores
      }
    }

    return reduce(keys(rawStores), (value, storeKey)=>{
      value[storeKey] = new rawStores[storeKey].default()
      return value
    }, {
      routing: new RouterStore()
    })
  }
}
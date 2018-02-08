// library imports
import { keys, map, reduce, without } from 'lodash'
import { inject, observer, Provider } from 'mobx-react'
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
    this.stores = this.loadStores()
    this.pages = this.loadPages()
    // while ssr we use different routing classes
    this.routingConf = (isSSR && request) ? this.buildStaticRoutingConf(request) : this.buildBrowserRoutingConf() 
  }

  load() {
    const storeKeys: string[] = without(keys(this.stores), 'routing')
    return (
      <Provider  { ...this.stores }>
        <this.routingConf.appRouter {...this.routingConf.routerProps}>
          <Switch>
            {map(this.pages, (page)=>{
              const path: string = (new page.default()).path
              const component = inject(...storeKeys)(observer(page.default))
              return (
                <Route exact path={path} component={ component } key={path}/>
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
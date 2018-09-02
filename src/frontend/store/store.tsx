/** @module Frontend */
import * as React from 'react'
import { App, deepFreeze } from '../'
import { Registry } from './'
import { NamedCache } from './named_cache'

export type Getter<S> = (state: S, view: IStore<S>['view'], opts?: any) => any
export type Getters<S> = { [name: string]: Getter<S> }

export type ActionResult<S> = Promise<Partial<S> | void> | Partial<S> | void
export type Action<S> = (store: IStore<S>, opts?: any) => ActionResult<S>
export type Actions<S> = { [name: string]: Action<S> }

export type StoreProps<S> = {
  actions: Actions<S>
  getters: Getters<S>
  name: string
  state: S
}

export interface IStore<S> {
  dispatch: (name: keyof Actions<S>, opts?: any) => ActionResult<S>
  name: string
  state: S
  view: (name: keyof Getters<S>, opts?: any) => any
}

export function createStore<S>(props: StoreProps<S>) {
  const { actions, getters, state } = props
  const ctx = React.createContext({} as any) as React.Context<IStore<S>>
  const getterCache = new NamedCache()
  const Provider = class extends React.Component<{}, S> implements IStore<S> {
    name = props.name
    state = Registry.initialStates[this.name] || state

    dispatch = async (key: keyof typeof actions, opts?: any): Promise<any> => {
      const ret: Partial<S> | void = await actions[key](this, opts)
      if (ret) {
        getterCache.reset()
        this.setState({ ...(this.state as any), ...(ret as any) })
        return ret
      }
    }

    view = (key: keyof typeof getters, opts?: any): any => {
      const cache = getterCache
      const value = cache.get(key as string, opts)
      return typeof value !== 'undefined'
        ? value
        : cache.set(
            key as string,
            getters[key](this.state, this.view, opts),
            opts
          )
    }

    render() {
      Registry.registerStore(this)
      const s: Readonly<S> = deepFreeze(this.state)
      const { dispatch, view } = this
      const value = { dispatch, view, state: s, name: this.name }
      return <ctx.Provider value={value}>{this.props.children}</ctx.Provider>
    }
  }

  const connect = (Component: any) => (initialProps: any) => (
    <Provider>
      <ctx.Consumer>
        {store => <Component {...initialProps} {...{ [store.name]: store }} />}
      </ctx.Consumer>
    </Provider>
  )

  const provide = (Component: any) => () => (
    <Provider>
      <Component />
    </Provider>
  )

  const consume = (Component: any) => (initialProps: any) => (
    <ctx.Consumer>
      {store => <Component {...initialProps} {...{ [store.name]: store }} />}
    </ctx.Consumer>
  )

  const register = (app: App) => {
    app.entities.stores.push({
      Consumer: ctx.Consumer,
      Provider,
      connect,
      name: props.name,
      provide,
    })
    return app
  }

  const name = props.name

  return { Consumer: ctx.Consumer, Provider, register, connect, name }
}

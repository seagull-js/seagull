import { root } from '../util'
import * as Store from './store'

export class StoreRegistry {
  stores: { [name: string]: Store.IStore<any> } = {}
  initialStates = (root as any).__initial_state__ || {}

  collectStates() {
    const names = this.names()
    const list = names.map(name => ({ [name]: this.stores[name].state }))
    return Object.assign({}, ...list)
  }

  names() {
    return Object.keys(this.stores)
  }

  registerStore(store: Store.IStore<any>) {
    this.stores[store.name] = store
  }

  removeStore(store: Store.IStore<any>) {
    delete this.stores[store.name]
  }

  reset() {
    this.stores = {}
    this.initialStates = {}
  }
}

const registry = new StoreRegistry()
export const Registry = registry

import { observable, action, computed } from 'mobx'
import { NetworkLayer } from './NetworkLayer'
export class DataStore {
  @observable data: any
  networkLayer: NetworkLayer
  constructor(initialData: any, networkLayer?: NetworkLayer) {
    this.data = initialData
    this.networkLayer = networkLayer || new NetworkLayer()
  }
  @action.bound
  async fetchNewData() {
    const fetchedData = await this.networkLayer.fetchJson()
    this.setData(fetchedData)
  }
  @action.bound
  setData(data: any) {
    this.data = data
  }
  @computed
  get fetchedDataString() {
    return JSON.stringify(this.data)
  }
}

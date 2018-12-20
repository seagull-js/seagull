import * as React from 'react'
import { Page, IPageProps } from '@seagull/pages'
import { NetworkLayer } from '../store/NetworkLayer'
import { Fetcher } from '../components/Fetcher'
import { DataStore } from '../store/DataStore'

export default class AsyncFetchingMobx extends Page<{
  networkLayer?: NetworkLayer
}> {
  store: DataStore
  constructor(props: { networkLayer?: NetworkLayer } & IPageProps) {
    super(props)
    this.store = new DataStore(this.props.data, this.props.networkLayer)
  }
  html() {
    return <Fetcher store={this.store} />
  }
}

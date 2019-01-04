import * as React from 'react'
import { observer } from 'mobx-react'
import { DataStore } from '../store/DataStore'
export interface FetcherProps {
  store: DataStore
}
@observer
export class Fetcher extends React.Component<FetcherProps> {
  render() {
    return (
      <div>
        <button onClick={this.props.store.fetchNewData}>Fetch Something</button>
        <div id="data-field">{this.props.store.fetchedDataString}</div>
      </div>
    )
  }
}

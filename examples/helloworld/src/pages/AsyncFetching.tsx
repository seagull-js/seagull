import * as React from 'react'
import { Page } from '@seagull/pages/dist/src/Page'

export default class AsyncFetching extends Page {
  state = { fetchedData: this.props.data as any }
  html() {
    return (
      <div>
        <div id="props-field">{JSON.stringify(this.props)}</div>
        <button onClick={this.onClick}>Fetch Something</button>
        <div id="data-field">{JSON.stringify(this.state.fetchedData)}</div>
      </div>
    )
  }
  onClick = async () => {
    const response = await fetch(
      'https://mdn.github.io/fetch-examples/fetch-json/products.json'
    )

    const fetchedData = await response.json()
    this.setState({ fetchedData })
  }
}

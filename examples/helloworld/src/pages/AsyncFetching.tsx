import * as React from 'react'
import { Page } from '@seagull/pages'

export default class AsyncFetching extends Page {
  state = { fetchedData: this.props.data as any }
  html() {
    return (
      <div>
        <button onClick={this.onClick}>Fetch Something</button>
        <div id="data-field">{JSON.stringify(this.state.fetchedData)}</div>
      </div>
    )
  }
  onClick = async () => {
    console.log('fetch...')
    const response = await fetch(
      'https://mdn.github.io/fetch-examples/fetch-json/products.json'
    )
    console.log('extract json...')
    const fetchedData = await response.json()
    console.log('fetch2...')
    const response2 = await fetch(
      'https://mdn.github.io/fetch-examples/fetch-json/products.json'
    )
    console.log('extract json2...')
    const fetchedData2 = await response.json()
    console.log('setState...')
    await this.setState(
      () => {
        console.log('state will be set with : ', fetchedData)
        return { fetchedData }
      },
      () => console.log('state set with : ', fetchedData)
    )
  }
}

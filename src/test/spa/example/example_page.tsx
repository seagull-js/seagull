import * as React from 'react'
import Page from '../../../lib/spa/page'

export default class ExamplePage extends Page<{}, {}> {
  path = '/'

  render() {
    return <h1>Hello World</h1>
  }
}
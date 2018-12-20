import * as React from 'react'
import { Page } from '@seagull/pages/dist/src/Page'

export default class HelloPage extends Page {
  html() {
    // tslint:disable-next-line:no-console
    console.log('rendering on client:', typeof window !== 'undefined')
    return <div>Hello, {this.props.data.name}</div>
  }
}

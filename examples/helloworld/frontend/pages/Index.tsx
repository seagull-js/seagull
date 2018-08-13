import { Page } from '@seagull/core'
import * as React from 'react'

export default class IndexPage extends Page {
  path: string = '/'

  /**
   * Page := wire up routing, data and a layout
   */
  html() {
    return <div>replace me!</div>
  }
}

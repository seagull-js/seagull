import { Page } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'

const css = style({
  textDecoration: 'underline',
})

export default class Index extends Page {
  path = '/'

  html() {
    return (
      <div>
        <h1 className={css}>Todos Example App</h1>
      </div>
    )
  }
}

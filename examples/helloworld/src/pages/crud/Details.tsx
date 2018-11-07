import { Page } from '@seagull/pages'
import * as React from 'react'
import { Term } from '../../items'

export default class Listing extends Page {
  title = () => `${this.props.data.item.id} | Glossary`

  html() {
    const item: Term = this.props.data.item
    return (
      <div>
        <h1>
          <a href="/glossary">Glossary</a>: {item.id}
        </h1>
        <p>{item.definition}</p>
      </div>
    )
  }
}

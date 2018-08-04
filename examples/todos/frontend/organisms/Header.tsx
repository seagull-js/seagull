import { Organism } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'

const background = style({
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  padding: 15,
})

const headline = style({
  margin: 0,
})

export default class TodoInput extends Organism {
  render() {
    return (
      <div className={background}>
        <h1 className={headline}>Todos Example App</h1>
      </div>
    )
  }
}

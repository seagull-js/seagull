import { Template } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'

import TodoInput from '../organisms/TodoInput'
import TodoList from '../organisms/TodoList'

const css = style({
  textDecoration: 'underline',
})

export interface ITodos {
  todos: Array<{ done: boolean; text: string }>
  addTodo: (text: string) => void
  toggleTodo: (index: number) => void
}

export default class Todos extends Template<ITodos> {
  render() {
    return (
      <div>
        <h1 className={css}>Todos Example App</h1>
        <>
          <TodoList items={this.props.todos} toggle={this.props.toggleTodo} />
          <TodoInput onSubmit={this.props.addTodo} />
        </>
      </div>
    )
  }
}

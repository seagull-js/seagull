import { Template } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'

import Header from '../organisms/Header'
import TodoInput from '../organisms/TodoInput'
import TodoList from '../organisms/TodoList'

const css = style({
  textDecoration: 'underline',
})

export interface ITodos {
  todos: Array<{ done: boolean; text: string }>
  addTodo: (text: string) => void
  toggleTodo: (index: number) => void
  input: string
}

export default class Todos extends Template<ITodos> {
  render() {
    return (
      <div
        style={{
          backgroundColor: '#ccc',
          boxSizing: 'border-box',
          minHeight: '100vh',
          padding: 15,
        }}
      >
        <Header />
        <TodoList items={this.props.todos} toggle={this.props.toggleTodo} />
        <TodoInput onSubmit={this.props.addTodo} />
      </div>
    )
  }
}

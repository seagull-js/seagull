import { Page } from '@seagull/core'
import * as React from 'react'

import Todos from '../templates/Todos'

export default class Index extends Page {
  path = '/'

  /** minimal inline state management */
  state = { input: '', todos: [] as Array<{ done: boolean; text: string }> }

  addTodo = (text: string) => {
    const todos = this.state.todos.concat({ done: false, text })
    this.setState({ todos })
  }

  toggleTodo = (index: number) => {
    const todos = this.state.todos
    todos[index].done = !todos[index].done
    this.setState({ todos })
  }

  html() {
    return (
      <Todos
        todos={this.state.todos}
        addTodo={this.addTodo}
        toggleTodo={this.toggleTodo}
        input={this.state.input}
      />
    )
  }
}

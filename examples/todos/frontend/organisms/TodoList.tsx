import { Organism } from '@seagull/core'
import * as React from 'react'

export interface ITodoListProps {
  items: Array<{ done: boolean; text: string }>
  toggle: (index: number) => void
}

export default class TodoList extends Organism<ITodoListProps> {
  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>status</th>
            <th>todo</th>
          </tr>
        </thead>
        <tbody>
          {this.props.items.map((item, index) => (
            <tr style={{ border: '1px solid black' }} key={index}>
              <td>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={e => this.props.toggle(index)}
                />
              </td>
              <td>{item.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

import { Molecule } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'
import StrikedText from '../atoms/StrikedText'
import Text from '../atoms/Text'

const css = style({
  backgroundColor: '#fff',
  padding: 5,
})

export interface ITodoColumnProps {
  todo: { done: boolean; text: string }
}

export default class TodoColumn extends Molecule<ITodoColumnProps> {
  render() {
    return (
      <tr className={css}>
        <td />
      </tr>
    )
  }

  renderText() {
    return <Text>{this.props.todo.text}</Text>
  }

  renderStriked() {
    return <StrikedText>{this.props.todo.text}</StrikedText>
  }
}

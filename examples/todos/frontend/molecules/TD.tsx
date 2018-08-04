import { Molecule } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'
import StrikedText from '../atoms/StrikedText'
import Text from '../atoms/Text'

const css = style({
  backgroundColor: '#fff',
  padding: 5,
})

export interface ITDProps {
  striked: boolean
}

export default class TD extends Molecule {
  render() {
    const text = this.props.striked ? this.renderStriked() : this.renderText()
    return <th className={css}>{text}</th>
  }

  renderText() {
    return <Text>{this.props.children as string}</Text>
  }

  renderStriked() {
    return <StrikedText>{this.props.children as string}</StrikedText>
  }
}

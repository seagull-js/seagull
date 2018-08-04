import { Molecule } from '@seagull/core'
import * as React from 'react'
import { style } from 'typestyle'
import Text from '../atoms/Text'

const css = style({
  backgroundColor: '#fff',
  padding: 5,
})

export default class TH extends Molecule {
  render() {
    return (
      <th className={css}>
        <Text>{this.props.children as string}</Text>
      </th>
    )
  }
}

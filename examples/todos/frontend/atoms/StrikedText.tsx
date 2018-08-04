import { Atom } from '@seagull/core'
import * as React from 'react'

export default class StrikedText extends Atom {
  render() {
    return (
      <p>
        <s>{this.props.children}</s>
      </p>
    )
  }
}

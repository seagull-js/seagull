import { Atom } from '@seagull/core'
import * as React from 'react'

export default class Text extends Atom {
  render() {
    return <p>{this.props.children}</p>
  }
}

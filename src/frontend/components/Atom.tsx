/** @module Frontend */
import * as React from 'react'

/**
 * All properties **must** be primitive values, because the underlying
 * [[React.PureComponent]] will perform only shallow prop comparison checks
 * on [[shouldComponentUpdate]].
 */
export interface IAtomProps {
  [propName: string]: any
}

/**
 * The smallest possible building block for designing things, this is level 1
 * in the "Atomic Design" metaphor.
 * It can only have primitive values as props and no children (except simple
 * strings), because they are *atomics*, thus not further divisible.
 * Examples are buttons, text elements, input fields or images.
 *
 * Definition: http://atomicdesign.bradfrost.com/outline/#atoms
 *
 * Use it like this:
 *
 * ```typescript
 * import { Atom } from '@seagull/framework'
 * import * as React from 'react'
 *
 * export default class Button extends Atom {
 *   render () {
 *     return <button onClick={this.props.handler}>{this.props.label}</button>
 *   }
 * }
 * ```
 */
export class Atom<P = {}> extends React.PureComponent<P & IAtomProps> {}

/** @module Frontend */
import * as React from 'react'
// import { Atom, IAtomProps } from './atom'

/**
 * All properties **must** be primitive values, because the underlying
 * [[React.PureComponent]] will perform only shallow prop comparison checks
 * on [[shouldComponentUpdate]].
 */
export interface IMoleculeProps {
  [propName: string]: any
}

/**
 * Combinations of Atoms (including native HTML elements) grouped together.
 *
 * Definition: http://atomicdesign.bradfrost.com/outline/#molecules
 *
 * Use it like this:
 *
 * ```typescript
 * import { Molecule } from '@seagull/framework'
 * import * as React from 'react'
 *
 * export default class Teaser extends Molecule {
 *   render () {
 *     return <button onClick={this.props.handler}>{this.props.label}</button>
 *   }
 * }
 * ```
 */
export class Molecule<P = {}> extends React.PureComponent<P & IMoleculeProps> {}

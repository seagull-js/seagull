/** @module Frontend */
import * as React from 'react'

/**
 * Combinations of Atoms, Molecules and/or other Organisms grouped together.
 * Examples are Forms, Navbars, Footers, ...
 *
 * Definition: http://atomicdesign.bradfrost.com/outline/#organisms
 *
 * Use it like this:
 *
 * ```typescript
 * class EmailForm extends Organism<{ handler: (email: string) => any }> {
 *   state = { email: '' }
 *   update = (event: React.ChangeEvent<HTMLInputElement>) =>
 *     this.setState({ email: event.target.value })
 *   submit = (event: React.MouseEvent<HTMLInputElement>) =>
 *     this.props.handler(this.state.email)
 *   render() {
 *     return (
 *       <form>
 *         <input name="email" value={this.state.email} onChange={this.update} />
 *         <input type="submit" onClick={this.submit} />
 *       </form>
 *     )
 *   }
 * }
 * ```
 */
export class Organism<P = {}, S = {}> extends React.Component<P, S> {}

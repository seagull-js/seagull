/** @module Scaffold */
import { Class } from '../'

/**
 * Generator for an [[Atom]] class
 *
 * @param name how to name the file. Must be CamelCased.
 */
export function AtomGenerator(name: string) {
  const gen = new Class(name, `Atom<I${name}Props>`, [`I${name}Props`])
  gen.addNamedImports('@seagull/core', ['Atom'])
  const docRender = `Atom := only use native HTML tags, no other components/children`
  const bodyRender = `return (
  <div>replace me!</div>
)`
  gen.addMethod({
    body: bodyRender,
    doc: docRender,
    name: 'render',
    parameter: [],
    returnType: undefined,
  })
  return gen
}

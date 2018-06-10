/** @module Scaffold */
import { Class } from '../'

export function AtomGenerator(name: string) {
  const gen = new Class(name, 'Atom<IProps>', [`I${name}Props`])
  // gen.addInterface('IProps')
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

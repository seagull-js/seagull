/** @module Scaffold */
import { Class } from '../'

export function MoleculeGenerator(name: string) {
  const gen = new Class(name, `Molecule<I${name}Props>`, [`I${name}Props`])
  // gen.addInterface('IProps')
  gen.addNamedImports('@seagull/core', ['Molecule'])
  const docRender = `Molecule := only use native HTML tags or Atoms`
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

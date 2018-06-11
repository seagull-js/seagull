/** @module Scaffold */
import { Class } from '../'

/**
 * Generator for an [[Molecule]] class
 *
 * @param name how to name the file. Must be CamelCased.
 */
export function MoleculeGenerator(name: string) {
  const gen = new Class(name, `Molecule<I${name}Props>`, [`I${name}Props`])
  gen.addNamedImports('@seagull/core', ['Molecule'])
  gen.addDefaultImport('react', 'React', true)
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

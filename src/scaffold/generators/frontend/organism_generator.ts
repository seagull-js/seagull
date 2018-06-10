/** @module Scaffold */
import { Class } from '../'

export function OrganismGenerator(name: string) {
  const gen = new Class(name, `Organism<I${name}Props>`, [`I${name}Props`])
  // gen.addInterface('IProps')
  gen.addNamedImports('@seagull/core', ['Organism'])
  const docRender = `Organism := use Atoms, Molecules and other Organisms as children/props`
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

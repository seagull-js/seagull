/** @module Scaffold */
import { Class } from '../'

/**
 * Generator for an [[Template]] class
 *
 * @param name how to name the file. Must be CamelCased.
 */
export function TemplateGenerator(name: string) {
  const gen = new Class(name, `Template<I${name}Props>`, [`I${name}Props`])
  gen.addNamedImports('@seagull/core', ['Template'])
  gen.addDefaultImport('react', 'React', true)
  const docRender = `Template := organize organisms into a page-like structure`
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

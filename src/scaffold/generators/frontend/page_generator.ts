/** @module Scaffold */
import { Class } from '../'

/**
 * Generator for an [[Page]] class
 *
 * @param name how to name the file. Must be CamelCased.
 */
export function PageGenerator(name: string, path: string = '/') {
  const gen = new Class(name, `Page`, [])
  gen.addNamedImports('@seagull/core', ['Page'])
  gen.addDefaultImport('react', 'React', true)
  gen.addProp({ name: 'path', type: 'string', value: `'${path}'` })
  const docRender = `Page := wire up routing, data and a layout`
  const bodyRender = `return (
  <div>replace me!</div>
)`
  gen.addMethod({
    body: bodyRender,
    doc: docRender,
    name: 'html',
    parameter: [],
    returnType: undefined,
  })
  return gen
}

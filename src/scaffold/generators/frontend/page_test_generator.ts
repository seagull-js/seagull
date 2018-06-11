/** @module Scaffold */
import { Class } from '../'

/**
 * Generator that returns an [[PageTest]] class
 *
 * @param name the Name of the tested Page. Must be CamelCased.
 */
export function PageTestGenerator(name: string) {
  const gen = new Class('Test', `PageTest<${name}>`)
  gen.addDecorator('suite', `'Unit::Frontend::Pages::${name}'`)

  gen.addNamedImports('@seagull/core', ['Page, PageTest'])
  gen.addNamedImports('chai/register-should', [])
  gen.addNamedImports('mocha-typescript', ['suite', 'test'])
  gen.addDefaultImport('../../../frontend/pages', name)

  gen.addProp({ name: 'page', type: 'Page', value: name })

  gen.addMethod({
    body: `this.html({}).should.be.equal('<div>replace me!</div>')`,
    decorator: { name: 'test' },
    name: `'returns html'`,
    parameter: [],
    returnType: undefined,
  })
  return gen
}

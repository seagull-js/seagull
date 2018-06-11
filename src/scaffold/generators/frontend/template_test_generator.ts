/** @module Scaffold */
import { Class } from '../'

/**
 * Generator that returns an [[TemplateTest]] class
 *
 * @param name the Name of the tested Template. Must be CamelCased.
 */
export function TemplateTestGenerator(name: string) {
  const gen = new Class('Test', `TemplateTest<${name}>`)
  gen.addDecorator('suite', `'Unit::Frontend::Templates::${name}'`)

  gen.addNamedImports('@seagull/core', ['Template, TemplateTest'])
  gen.addNamedImports('chai/register-should', [])
  gen.addNamedImports('mocha-typescript', ['suite', 'test'])
  gen.addDefaultImport('../../../frontend/templates', name)

  gen.addProp({ name: 'template', type: 'Template', value: name })

  gen.addMethod({
    body: `this.html({}).should.be.equal('<div>replace me!</div>')`,
    decorator: { name: 'test' },
    name: `'returns html'`,
    parameter: [],
    returnType: undefined,
  })
  return gen
}

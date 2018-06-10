/** @module Scaffold */
import { Class } from '../'

/**
 * Generator that returns an [[MoleculeTest]] class
 *
 * @param name the Name of the tested Molecule. Must be CamelCased.
 */
export function MoleculeTestGenerator(name: string) {
  const gen = new Class('Test', `MoleculeTest<${name}>`)
  gen.addDecorator('suite', `'Unit::Frontend::Molecules::${name}'`)

  gen.addNamedImports('@seagull/core', ['Molecule, MoleculeTest'])
  gen.addNamedImports('chai/register-should', [])
  gen.addNamedImports('mocha-typescript', ['suite', 'test'])
  gen.addDefaultImport('../../../frontend/molecules', name)

  gen.addProp({ name: 'molecule', type: 'Molecule', value: name })

  gen.addMethod({
    body: `this.html({}).should.be.equal('<div>replace me!</div>')`,
    decorator: { name: 'test' },
    name: `'returns html'`,
    parameter: [],
    returnType: undefined,
  })
  return gen
}

/** @module Scaffold */
import { Class } from '../'

export function OrganismTestGenerator(name: string) {
  const gen = new Class('Test', `OrganismTest<${name}>`)
  gen.addDecorator('suite', `'Unit::Frontend::Organisms::${name}'`)

  gen.addNamedImports('@seagull/core', ['Organism, OrganismTest'])
  gen.addNamedImports('chai/register-should', [])
  gen.addNamedImports('mocha-typescript', ['suite', 'test'])
  gen.addDefaultImport('../../../frontend/organisms', name)

  gen.addProp({ name: 'organism', type: 'Organism', value: name })

  gen.addMethod({
    body: `this.html({}).should.be.equal('<div>replace me!</div>')`,
    decorator: { name: 'test' },
    // tslint:disable-next-line:quotemark
    name: "'returns html'",
    parameter: [],
    returnType: undefined,
  })
  return gen
}

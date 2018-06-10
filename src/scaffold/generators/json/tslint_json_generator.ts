/** @module Scaffold */
import { JsonGenerator as Json } from './'

const rules = {
  'interface-over-type-literal': [false],
  'max-classes-per-file': [false],
  'member-access': [true, 'no-public'],
  'no-console': [true, 'log', 'error'],
  quotemark: [true, 'single', 'jsx-double'],
}

export function TslintJsonGenerator(): Json {
  const gen = new Json()
  gen.set('defaultSeverity', 'error')
  gen.set('extends', ['tslint:recommended', 'tslint-config-prettier'])
  gen.set('jsRules', {})
  gen.set('rules', rules)
  gen.set('rulesDirectory', [])
  return gen
}

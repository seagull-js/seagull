/** @module Scaffold */
import { JsonGenerator as Json } from './'

/**
 * the default rules for TSLint for seagull projects
 */
export const tslintRules = {
  'interface-over-type-literal': [false],
  'max-classes-per-file': [false],
  'member-access': [true, 'no-public'],
  'no-console': [true, 'log', 'error'],
  quotemark: [true, 'single', 'jsx-double'],
}

/**
 * generate a tslint.json file for seagull projects, using [[tslintRules]]
 */
export function TslintJsonGenerator(): Json {
  const gen = new Json()
  gen.set('defaultSeverity', 'error')
  gen.set('extends', ['tslint:recommended', 'tslint-config-prettier'])
  gen.set('jsRules', {})
  gen.set('rules', tslintRules)
  gen.set('rulesDirectory', [])
  return gen
}

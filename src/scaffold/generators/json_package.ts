/** @module Scaffold */
import { join } from 'path'
import { Json } from './'

export function JsonPackage(name: string, version: string): Json {
  const gen = new Json()
  // basic info
  gen.set('name', name)
  gen.set('version', '0.1.0')
  gen.set('description', 'my new seagull app')
  gen.set('private', true)
  gen.set('browser', '.seagull/dist/frontend/index.js')
  // enforce node version for lambda compatibility
  gen.set('engineStrict', true)
  gen.set('engines', { node: '8.10' })
  // add dependencies
  gen.set('dependencies', { '@seagull/core': `^${version}` })
  gen.set('devDependencies', {
    '@types/history': '^4.6.0',
    '@types/node': '^8.0.25',
    '@types/react': '^16.3.12',
    '@types/react-dom': '^16.4.1',
    'aws-sdk': '^2.104.0',
    typescript: '^2.9.0',
  })
  return gen
}

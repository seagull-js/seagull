/** @module Scaffold */
import { JsonGenerator as Json } from './'

/**
 * the default settings for the typescript compiler
 */
export const compilerOptions = {
  declaration: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  jsx: 'react',
  lib: ['es5', 'es6', 'es7', 'dom', 'dom.iterable'],
  module: 'commonjs',
  outDir: '.seagull/dist',
  removeComments: true,
  rootDirs: ['backend', 'frontend', 'lib'],
  skipLibCheck: true,
  sourceMap: true,
  strict: true,
  target: 'es5',
}

/**
 * Create a tsconfig.json for a seagull project based on [[compilerOptions]]
 */
export function TsconfigJsonGenerator(): Json {
  const gen = new Json()
  gen.set('compilerOptions', compilerOptions)
  gen.set('typeRoots', ['node_modules/@types'])
  gen.set('types', ['node'])
  return gen
}

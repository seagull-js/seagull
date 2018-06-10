/** @module Scaffold */
import { camelize, singularize } from 'inflection'
import { basename, extname } from 'path'
import { Base } from '../'

/**
 * Generate an index.ts file that re-exports things.
 *
 * @param folderPaths the list of modules to re-export
 * @param namespaced when true, emit `export * from 'module-name'`
 */
export function ExportsGenerator(folderPaths: string[], namespaced?: boolean) {
  const gen = new Base()
  folderPaths.forEach(f => (namespaced ? addAll(gen, f) : addNamed(gen, f)))
  return gen
}

function addAll(gen: Base, file: string): void {
  gen.addNamespacedExport(file)
}

function addNamed(gen: Base, file: string): void {
  const name = basename(file, extname(file))
  gen.addNamedDefaultExport(file, singularize(camelize(name)))
}

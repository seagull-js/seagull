/** @module Tools */
import * as fs from 'fs'
import { flatten } from 'lodash'
import * as ts from 'typescript'
import { listFiles, writeFile } from './'

/**
 * Directly transpiles a typescript source file to a javascript source file.
 * This will NOT actually parse modules, import things, and so on, so it can
 * be used in a fast way, ignoring _(missing)_ node_modules.
 *
 * @param from absolute path to the source file
 * @param to absolute path to the destination file
 * @param opts tsconfig settings
 */
export function transpileFile(from: string, to: string, opts?: any) {
  const sourceText = fs.readFileSync(from, 'utf-8')
  transpileCode(sourceText, to, opts)
}

/**
 * Transpile a given blob of typescript code directly to a javascript file.
 *
 * @param sourceText the code as string representation
 * @param to absolute path to the destination file
 * @param opts tsconfig settings
 */
export function transpileCode(sourceText: string, to: string, opts?: any) {
  const code = translateCode(sourceText, opts)
  writeFile(to, code)
}

/**
 * Transpile a given blob of typescript code directly to a javascript blob.
 *
 * @param sourceText the code as string representation
 * @param to absolute path to the destination file
 * @param opts tsconfig settings
 */
export function translateCode(sourceText: string, opts?: any): string {
  const module = ts.ModuleKind.CommonJS
  const target = ts.ScriptTarget.ES2015
  const compilerOptions = opts || { module, target }
  compilerOptions.jsx = ts.JsxEmit.React
  const { outputText } = ts.transpileModule(sourceText, { compilerOptions })
  return outputText
}

/**
 * Recursive transpilation of typescript files for a given folder. Files not
 * ending with `.ts` or `.tsx` are copied as-is.
 *
 * @param from absolute path to the source folder
 * @param to absolute path to the destination folder
 * @param opts tsconfig settings
 */
export function transpileFolder(from: string, to: string, opts?: any) {
  const srcList = listFiles(from)
  const rename = (file: string) => file.replace(from, to).replace(/tsx?$/, 'js')
  const tp = (file: string) => transpileFile(file, rename(file), opts)
  const cp = (file: string) => writeFile(rename(file), fs.readFileSync(file))
  srcList.forEach((file: string) => (/tsx?$/.test(file) ? tp(file) : cp(file)))
}

import * as ts from 'typescript'

export class Typescript {
  static transpile(source: string, opts?: any): string {
    const module = ts.ModuleKind.CommonJS
    const target = ts.ScriptTarget.ES2015
    const compilerOptions = opts || { module, target }
    compilerOptions.jsx = ts.JsxEmit.React
    const { outputText } = ts.transpileModule(source, { compilerOptions })
    return outputText
  }
}

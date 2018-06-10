/** @module Scaffold */
import * as prettier from 'prettier'
import Ast, { IndentationText, QuoteKind, SourceFile } from 'ts-simple-ast'
import * as ts from 'typescript'
import { writeFile } from '../../tools/util'

const astSettings = {
  manipulationSettings: {
    indentationText: IndentationText.TwoSpaces,
    quoteType: QuoteKind.Single,
    scriptTarget: ts.ScriptTarget.Latest,
  },
  useVirtualFileSystem: true,
}

const prettierSettings: prettier.Options = {
  parser: 'babylon',
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
}

/**
 * General Setup for the AST tooling and common functionality for code
 * generation. More specialized file types (like classes, functions) should
 * extend from this class.
 *
 * AST Docs: https://dsherret.github.io/ts-simple-ast/
 */
export class Base {
  protected sourceFile: SourceFile

  constructor() {
    const ast = new Ast(astSettings)
    this.sourceFile = ast.createSourceFile('virtual.ts')
  }

  /**
   * Add a normal import to the file, like `import name from 'module'`
   *
   * @param from module or filepath to load code from
   * @param name how to name the import for further usage
   * @param legacy set this flag to true to get '* as name' syntax
   */
  addDefaultImport(from: string, name: string, legacy?: boolean): this {
    const token = legacy ? `* as ${name}` : name
    const opts = { moduleSpecifier: from, defaultImport: token }
    this.sourceFile.addImportDeclaration(opts)
    return this
  }

  /**
   *  Add multiple named imports to the file, like
   * `import { A, B } from 'module'`.
   *
   * @param from module or filepath to load code from
   * @param names which objects to load from the module
   */
  addNamedImports(from: string, names: string[]): this {
    const namedImports = names.map(name => ({ name }))
    const opts = { moduleSpecifier: from, namedImports }
    this.sourceFile.addImportDeclaration(opts)
    return this
  }

  /**
   * Add a simple interface declaration and export it
   *
   * @param name name of the interface
   */
  addInterface(name: string): this {
    const opts = { name, export: true }
    const intf = this.sourceFile.addInterface(opts)
    intf.setIsExported(true)
    return this
  }

  /**
   * Return textual representation of the current AST state, already prettified
   */
  toString(): string {
    const sourceCode = this.sourceFile.getFullText()
    let prettyCode: string = ''
    try {
      prettyCode = prettier.format(sourceCode, prettierSettings)
    } catch (error) {
      // prettier is broken in combination with mock-fs :-(
      prettyCode = sourceCode
    }
    return prettyCode
  }

  /**
   * Write the current AST directly to a file, overwrite if file already exists.
   *
   * @param filePath absolute path where the file will get written
   */
  toFile(filePath: string): void {
    writeFile(filePath, this.toString())
  }
}

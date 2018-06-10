/** @module Scaffold */
import CodeBlockWriter from 'code-block-writer' // ambient from ast below
import Ast, { FunctionDeclaration } from 'ts-simple-ast'
import { Base } from './'

export class Function extends Base {
  private functionDeclaration: FunctionDeclaration

  constructor(name: string) {
    super()
    this.functionDeclaration = this.sourceFile.addFunction({ name })
    this.functionDeclaration.setIsDefaultExport(true)
  }

  setReturnType(type: string): this {
    this.functionDeclaration.setReturnType(type)
    return this
  }

  addParam(name: string, type?: string): this {
    this.functionDeclaration.addParameter({ name, type })
    return this
  }

  setBodyText(text: string): this {
    this.functionDeclaration.setBodyText(text)
    return this
  }

  setBodyComplex(fn: (writer: CodeBlockWriter) => void): this {
    this.functionDeclaration.setBodyText(fn)
    return this
  }
}

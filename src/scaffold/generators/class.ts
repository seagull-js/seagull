/** @module Scaffold */

import Ast, { ClassDeclaration } from 'ts-simple-ast'
import { ConstructorDeclarationStructure } from 'ts-simple-ast'
import { Base } from './'

export interface IClassProp {
  name: string
  type: string
  static?: boolean
  value?: string
  doc?: string
  decorators?: Array<{
    name: string
    arguments?: any[]
  }>
}

export interface IMethod {
  name: string
  async?: boolean
  static?: boolean
  returnType?: string
  parameter?: Array<{
    name: string
    type: string
  }>
  body?: string // inline stuff works for now
  doc?: string
  decorator?: { name: string; arguments?: any[] }
}

export class Class extends Base {
  private classDeclaration: ClassDeclaration

  constructor(name: string, parent?: string, interfaces: string[] = []) {
    super()
    interfaces.forEach(itf => this.addInterface(itf))
    this.classDeclaration = this.sourceFile.addClass({ name })
    this.classDeclaration.setIsDefaultExport(true)
    if (parent) {
      this.classDeclaration.setExtends(parent)
    }
  }

  addConstructor(params: ConstructorDeclarationStructure): this {
    this.classDeclaration.addConstructor(params)
    return this
  }

  addDecorator(name: string, ...args: any[]): this {
    this.classDeclaration.addDecorator({ name, arguments: args })
    return this
  }

  addMethod(params: IMethod): this {
    const opts = { isStatic: !!params.static, name: params.name }
    const method = this.classDeclaration.addMethod(opts)
    if (params.async) {
      method.setIsAsync(true)
    }
    if (params.parameter && params.parameter.length) {
      params.parameter.forEach((p, i) => method.insertParameter(i, p))
    }
    if (params.returnType) {
      method.setReturnType(params.returnType)
    }
    if (params.body) {
      method.setBodyText(params.body)
    }
    if (params.doc) {
      method.addJsDoc({ description: params.doc })
    }
    if (params.decorator) {
      method.addDecorator(params.decorator)
    }
    return this
  }

  addProp(params: IClassProp): this {
    const { name, type } = params
    const opts = { name, type, isStatic: !!params.static }
    const prop = this.classDeclaration.addProperty(opts)
    if (params.value) {
      prop.setInitializer(params.value)
    }
    if (params.decorators && params.decorators.length) {
      prop.addDecorators(params.decorators)
    }
    if (params.doc) {
      prop.addJsDoc({ description: params.doc })
    }
    return this
  }
}

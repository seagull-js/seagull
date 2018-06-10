/** @module Scaffold */

import { Class } from './'

export interface IPageOptions {
  path: string
}

export function Page(name: string, options: IPageOptions): Class {
  const gen = new Class(name, 'Page<{}, {}>')
  gen.addDefaultImport('react', 'React', true)
  gen.addNamedImports('@seagull/framework', ['Page'])

  const path = options.path.startsWith('/') ? options.path : `/${options.path}`

  const docPath = `the url path this page will be mounted on`
  gen.addProp({
    doc: docPath,
    name: 'path',
    static: false,
    type: 'string',
    value: `'${path}'`,
  })

  const docRender = `outputs the HTML of this Page`
  const body = `
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  )`
  gen.addMethod({
    body,
    doc: docRender,
    name: 'render',
    parameter: [],
    returnType: undefined,
  })

  return gen
}

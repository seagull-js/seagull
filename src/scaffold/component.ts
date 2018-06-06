/** @module Scaffold */
import * as NS from './'

export function Component(
  name: string,
  classic?: boolean
): NS.Class | NS.Function {
  const gen = classic ? generateClass(name) : generateFunction(name)
  gen.addDefaultImport('react', 'React', true)
  return gen
}

function generateClass(name: string): NS.Class {
  const gen = new NS.Class(name, 'React.Component<IProps, IState>', true)
  gen.addConstructor({
    bodyText: 'super(props)\n this.state = {}',
    parameters: [{ name: 'props', type: 'IProps' }],
  })
  gen.addInterface('IProps')
  gen.addInterface('IState')
  const docRender = `outputs the HTML of this Page`
  const bodyRender = `
    return (
      <div>
        <h1>Hello World!</h1>
      </div>
    )`
  gen.addMethod({
    body: bodyRender,
    doc: docRender,
    name: 'render',
    parameter: [],
    returnType: undefined,
  })
  return gen
}

function generateFunction(name: string): NS.Function {
  const gen = new NS.Function(name)
  gen.addParam('{ children }')
  gen.setBodyText(`
    return (
      <>
        <div>replace me!</div>
      </>
    );
    `)
  return gen
}

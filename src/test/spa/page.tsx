import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ExamplePage from './example/example_page'

@suite('Simple Frontend Pages')
class FrontendPages {
  @test
  async 'simple text response works'() {
    const examplePage = new ExamplePage({})
    expect(examplePage.path).to.be.equal('/')
    const content = renderToStaticMarkup(<ExamplePage />)
    expect(content).to.be.equal('<h1>Hello World</h1>')
  }
}

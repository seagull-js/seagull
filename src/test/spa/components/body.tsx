import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import Body from '../../../lib/spa/components/body'

@suite('simple body component')
class BodyTest {
  @test
  async 'simple body without anything works'() {
    const content = renderToStaticMarkup(<Body renderedContent="<h1></h1>" />)
    expect(content).to.be.equal('<body><div id="root"><h1></h1></div></body>')
  }

  @test
  async 'simple body with children and innerHtml works'() {
    const content = renderToStaticMarkup(
      <Body renderedContent="<h1></h1>">
        <h2 />
      </Body>
    )
    expect(content).to.be.equal(
      '<body><div id="root"><h1></h1></div><h2></h2></body>'
    )
  }
}

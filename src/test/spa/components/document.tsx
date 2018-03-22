import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import Document from '../../../lib/spa/components/document'
import { ReadOnlyConfig } from '../../../lib/util'

@suite('simple document component')
class DocumentTest {
  @test
  async 'simple document without anything works'() {
    process.env.config_mock = JSON.stringify({})
    const content = renderToStaticMarkup(<Document content={'here yo are'} />)
    expect(content).to.be.equal(
      '<html><head><title data-react-helmet="true"></title><style id="styles-target"></style><link rel="icon" href="/favicon.ico"/></head><body><div id="root">here yo are</div><script src="/assets/bundle.js"></script></body></html>'
    )
  }
  @test
  async 'simple document with ga and analytics works'() {
    ReadOnlyConfig.config.analytics = { ga: 'UA-23423', enabled: true }
    const content = renderToStaticMarkup(<Document content={'here yo are'} />)
    expect(content).to.contain('UA-23423')
    expect(content).to.contain('window.analytics')
  }
}

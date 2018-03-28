import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import Head from '../../../lib/spa/components/head'

@suite('simple head component')
class HeadTest {
  @test
  async 'simple head without anything works'() {
    const content = renderToStaticMarkup(<Head />)
    content.should.contain(
      '<head><title data-react-helmet="true"></title><style id="styles-target">'
    )
    content.should.contain(
      '</style><link rel="icon" href="/favicon.ico"/></head>'
    )
  }

  @test
  async 'simple head children injection works'() {
    const content = renderToStaticMarkup(
      <Head>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        />
      </Head>
    )
    content.should.contain(
      `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>`
    )
  }

  @test
  async 'simple head with helmet state and children works'() {
    const head = renderToStaticMarkup(
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
      </Helmet>
    )
    const content = renderToStaticMarkup(
      <Head>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        />
      </Head>
    )
    content.should.contain(
      `<head><title data-react-helmet="true">My Title</title><meta data-react-helmet="true" charSet="utf-8"/><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"/>`
    )
  }

  @test
  async 'normalize css gets injected'() {
    const content = renderToStaticMarkup(<Head />)
    content.should.contain('margin:0')
  }
}

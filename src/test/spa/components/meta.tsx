import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import Head from '../../../lib/spa/components/head'
import Meta from '../../../lib/spa/components/meta'

@suite('Meta component')
class BodyTest {
  @test
  async 'Meta without anything works (does not crash)'() {
    const content = renderToStaticMarkup(<Meta title={'My title'} />)
    // tslint:disable-next-line:no-console
    console.log(content)
    expect(content).to.be.equal('')
  }

  @test
  async 'Meta writes to head'() {
    const content = renderToStaticMarkup(
      <>
        <Meta title={'My title'} />
        <Head />
      </>
    )
    expect(
      content.indexOf('<title data-react-helmet="true">My title</title>')
    ).to.be.above(0)
  }
  @test
  async 'Meta children are working'() {
    const content = renderToStaticMarkup(
      <>
        <Meta title={'My title'}>
          <meta name="viewport" content="width=device-width, initial-scale=1" />{' '}
        </Meta>
        <Head />
      </>
    )
    expect(content).to.contain('viewport')
  }
}

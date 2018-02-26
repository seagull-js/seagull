import { expect } from 'chai';
import { skip, slow, suite, test, timeout } from 'mocha-typescript';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Helmet } from 'react-helmet';
import Head from '../../../lib/spa/components/head';
import SEO from '../../../lib/spa/components/seo';

@suite('seo component')
class BodyTest {
  @test
  async 'seo without anything works (does not crash)'() {
    const content = renderToStaticMarkup(<SEO title={'My title'} />);
    // tslint:disable-next-line:no-console
    console.log(content);
    expect(content).to.be.equal('');
  }

  @test
  async 'seo writes to head'() {
    const content = renderToStaticMarkup(<><SEO title={'My title'} /><Head /></>);
    expect(content.indexOf('<title data-react-helmet="true">My title</title>')).to.be.above(0)
  }
}

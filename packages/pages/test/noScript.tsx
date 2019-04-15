import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { Helmet, NoScript, Page, render } from '../src'

class NoScriptPage extends Page {
  html() {
    return (
      <div>
        <NoScript>Your javascript is disabled!</NoScript>
      </div>
    )
  }
}

@suite('NoScript')
export class Test {
  static before() {
    Helmet.canUseDOM = false
  }

  static after() {
    Helmet.canUseDOM = true
  }

  @test
  async 'adds string to noscript html'() {
    const html = render('', NoScriptPage, {})
    const { document } = new JSDOM(html).window
    console.log('document', document)
    const el = document.getElementsByTagName('noscript')[0]
    expect(el.title).to.equal('noscript-the-one-and-only')
    expect(el.innerHTML).to.be.a('string')
    expect(el.innerHTML).to.equal('Your javascript is disabled!')
  }
}

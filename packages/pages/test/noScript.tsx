import { expect } from 'chai'
import 'chai/register-should'
import { JSDOM } from 'jsdom'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { Helmet, Page, render } from '../src'

declare module 'jsdom'

class NoScriptPage extends Page {
  static noScript = 'Your javascript is disabled!'
  html() {
    return <div />
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
    const el = document.getElementsByTagName('noscript')[0]
    expect(el.innerHTML).to.be.a('string')
    expect(el.innerHTML).to.equal('Your javascript is disabled!')
  }
}

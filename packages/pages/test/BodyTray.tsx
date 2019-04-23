import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { addToBodyTray, Helmet, Page, render, style } from '../src'

class DemoPage extends Page {
  html() {
    addToBodyTray('bodyBegin', <div id="bodytraytest" />, 0)
    const divClass = style({ $debugName: 'test', background: 'black' })
    return <div className={divClass}>Hello</div>
  }
}

@suite('BodyTray')
export class Test {
  @test
  async 'get the div that has been added to the bodytray'() {
    const html = render('', DemoPage, {})
    html.should.be.a('string')
    html.should.contain('<div id="bodytraytest"></div>')
  }
}

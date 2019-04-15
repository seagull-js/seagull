import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { Helmet, Page, render, style } from '../src'

class DemoPage extends Page {
  html() {
    const divClass = style({ $debugName: 'test', background: 'black' })
    return <div className={divClass}>Hello</div>
  }
}

@suite('TypeStyle')
export class Test {
  static before() {
    Helmet.canUseDOM = false
  }

  static after() {
    Helmet.canUseDOM = true
  }

  @test
  async 'get a classname from typestyle and inject typestyle styles in the head'() {
    const html = render('', DemoPage, {})
    html.should.be.a('string')
    html.should.contain(
      '<style id="styles-target">.test_fumfvp2{background:black}</style>'
    )
    html.should.contain('<div class="test_fumfvp2">Hello</div>')
  }
}

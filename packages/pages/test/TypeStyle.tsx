import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { Page, render, style } from '../src'

class DemoPage extends Page {
  html() {
    const divClass = style({ $debugName: 'test', background: 'black' })
    return <div className={divClass}>Hello</div>
  }
}

@suite('TypeStyle')
export class Test {
  @test
  async 'get a classname from typestyle and inject typestyle styles in the head'() {
    const html = render('', DemoPage, {})
    console.log(html)
    html.should.be.a('string')
    html.should.contain(
      '<style data-react-helmet="true" id="styles-target">.test_fumfvp2{background:black}</style>'
    )
    html.should.contain('<div class="test_fumfvp2">Hello</div>')
  }
}

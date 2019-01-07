import { Route, RouteTest } from '@seagull/routes'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'
import { Page, style } from '../src'

class DemoPage extends Page {
  html() {
    const divClass = style({ $debugName: 'test', background: 'black' })
    return <div className={divClass}>Hello</div>
  }
}

class DemoRoute extends Route {
  static method = 'GET'
  static path = '/'
  async handler() {
    return this.render(DemoPage, {})
  }
}

@suite('TypeStyle')
export class Test extends RouteTest {
  route = DemoRoute

  @test
  async 'get a classname from typestyle and inject typestyle styles in the head'() {
    const { code, data, headers } = await this.invoke('GET', '/', {})
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/html')
    data.should.be.a('string')
    data.should.contain(
      '<style data-react-helmet="true" id="styles-target">.test_fumfvp2{background:black}</style>'
    )
    data.should.contain('<div class="test_fumfvp2">Hello</div>')
  }
}

import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { Page } from '../src'
import { PageTest } from '../src/test'

class DemoPage extends Page {
  html() {
    return <div>Hello, {this.props.data.name}</div>
  }
}

@suite('Page::CustomData')
export class Test extends PageTest {
  Page = DemoPage
  @test
  'can render a DemoPage with custom data'() {
    const name = 'John Doe'
    this.mount({ data: { name } })
    this.page.text().should.contain(name)
  }
}

import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { Page, PageTest } from '../src'

class DemoPage extends Page {
  html() {
    return <div>Hello, {this.props.data.name}</div>
  }
}

@suite('DemoPage')
export class DemoPageTest extends PageTest {
  Page = DemoPage
  @test
  'can render page with any name'() {
    this.page.text().should.be.equal('Hello, ')
  }
}

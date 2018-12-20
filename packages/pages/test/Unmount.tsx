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

@suite('Page::Unmount')
export class Test extends PageTest {
  Page = DemoPage
  @test
  'can render a DemoPage with custom data'() {
    const name = 'John Doe'
    this.mount({ data: { name } })
    this.page.text().should.contain(name)
  }
  @test
  'resets this.page after every test'() {
    this.page.text().should.not.contain('John Doe')
  }
  @test
  'can use unmount, althought it is supposed to be rarely used'() {
    const name = 'John Doe'
    this.mount({ data: { name } })
    this.page.text().should.contain('John Doe')
    this.unmount()
    this.page.text().should.contain('Hello')
    this.page.text().should.not.contain('John Doe')
  }
}

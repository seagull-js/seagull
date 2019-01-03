import { Page } from '@seagull/pages'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { PageTest } from '../src'

class DemoPage extends Page {
  state = { bla: '', num: 0 }
  html() {
    return (
      <div>
        Hello, {this.props.data.name}, {this.state.bla}
      </div>
    )
  }
  onClick = async () => {
    await fetch('https://mdn.github.io/fetch-examples/fetch-json/products.json')
    this.setState(({ num }: DemoPage['state']) => ({
      bla: 'Update Nr. ' + (num + 1),
      num: num + 1,
    }))
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

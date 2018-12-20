import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { Page } from '../src'
import { PageTest } from '../src/test'

const somethingAsynchronous = () =>
  Promise.resolve({ message: 'response is here' })

class DemoPage extends Page {
  state = { message: '' }
  async componentDidMount() {
    const response = await somethingAsynchronous()
    this.setState(response)
  }
  html() {
    return <div>Message: {this.state.message}</div>
  }
}

@suite('Page::NetworkRequest')
export class Test extends PageTest {
  Page = DemoPage
  @test
  async 'cannot update DemoPage before it is mounted somehow'() {
    let errorIsThrown = false
    let msg = ''
    try {
      this.update()
    } catch (err) {
      errorIsThrown = true
      msg = err.message
    }
    // tslint:disable:no-unused-expression
    errorIsThrown.should.be.true
    msg.should.contain(
      'You must call this.mount() before you await this.update() in your PageTest'
    )
  }
  @test
  async 'can render a DemoPage with an asynchronous request'() {
    this.page.text().should.not.contain('response is here')
    await this.update()
    this.page.text().should.contain('response is here')
  }
}

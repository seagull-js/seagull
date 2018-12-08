import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import HelloPage from '../../src/pages/HelloPage'
import * as React from 'react'
import { PageTest } from '@seagull/pages/src'

@suite('HelloPage')
export class HelloPageTest extends PageTest {
  page = HelloPage
  @test
  'can render page with any name'() {
    const name = 'John Doe'
    this.mount({ data: { name } })
    this.wrapper.text().should.contain(name)
  }
}

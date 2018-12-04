import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import HelloPage from '../../src/pages/HelloPage'
import * as React from 'react'

@suite('HelloPage')
export class HelloPageTest extends BasicTest {
  @test
  'can render page with any name'() {
    const name = 'John Doe'
    const wrapper = mount(<HelloPage data={{ name }} />)
    wrapper.text().should.contain(name)
  }
}

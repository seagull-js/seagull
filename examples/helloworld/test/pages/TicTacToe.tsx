import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import TicTacToe from '../../src/pages/TicTacToe'
import * as React from 'react'

@suite('TicTacToe')
export class TicTacToeTest extends BasicTest {
  @test
  'can test a use-case as part of an integration test'() {
    const wrapper = mount(<TicTacToe data={{}} />)
    wrapper.text().should.contain('Current Player: X')
    wrapper.text().should.contain('No game played yet.')
    const grid = wrapper.find('#grid')
    grid.childAt(0).simulate('click')
    wrapper.text().should.contain('Current Player: O')
    grid.childAt(3).simulate('click')
    wrapper.text().should.contain('Current Player: X')
    grid.childAt(1).simulate('click')
    wrapper.text().should.contain('Current Player: O')
    grid.childAt(4).simulate('click')
    wrapper.text().should.contain('Current Player: X')
    grid.childAt(2).simulate('click')
    wrapper.text().should.contain('Last Result: X won.')
  }
}

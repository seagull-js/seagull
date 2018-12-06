/* import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import TicTacToe from '../../src/pages/TicTacToe'
import * as React from 'react'

@suite('TicTacToe').skip()
export class TicTacToeTest extends BasicTest {
  page = TicTacToe
  @test
  'can test a use-case as part of an integration test'() {
    this.mount({name: 'Udo Jürgens'})
    this.text().should.contain('Current Player: X')
    this.text().should.contain('No game played yet.')
    const grid = this.getElementById('grid')
    grid.childAt(0).simulate('click')
    this.text().should.contain('Current Player: O')
    grid.childAt(3).simulate('click')
    this.text().should.contain('Current Player: X')
    grid.childAt(1).simulate('click')
    this.text().should.contain('Current Player: O')
    grid.childAt(4).simulate('click')
    this.text().should.contain('Current Player: X')
    grid.childAt(2).simulate('click')
    this.text().should.contain('Last Result: X won.')
    const gridCell = this.getNthByClassName('grid-cell', 5)

  }
}
 */

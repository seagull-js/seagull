import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import TicTacToe from '../../src/pages/TicTacToe'
import { PageTest } from '@seagull/pages/src'

@suite('TicTacToe')
export class TicTacToeTest extends PageTest {
  page = TicTacToe
  @test
  'can test a use-case as part of an integration test'() {
    this.wrapper.text().should.contain('Current Player: X')
    this.wrapper.text().should.contain('No game played yet.')
    const grid = this.wrapper.find('#grid')
    grid.childAt(0).simulate('click')
    this.wrapper.text().should.contain('Current Player: O')
    grid.childAt(3).simulate('click')
    this.wrapper.text().should.contain('Current Player: X')
    grid.childAt(1).simulate('click')
    this.wrapper.text().should.contain('Current Player: O')
    grid.childAt(4).simulate('click')
    this.wrapper.text().should.contain('Current Player: X')
    grid.childAt(2).simulate('click')
    this.wrapper.text().should.contain('Last Result: X won.')
  }
}

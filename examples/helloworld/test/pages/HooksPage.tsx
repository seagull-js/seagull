import { PageTest } from '@seagull/test-pages'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import HooksPage from '../../src/pages/HooksPage'

@suite('HooksPage')
export class HooksPageTest extends PageTest {
  Page = HooksPage
  @test
  'can render page'() {
    this.mount()
    this.page.text().should.contain('0')
  }

  @test
  'can update count'() {
    this.mount()
    this.page.find('button').simulate('click')
    this.page.text().should.contain('1')
  }
}

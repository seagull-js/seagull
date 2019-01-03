import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import SecondsLeft from '../../src/pages/SecondsLeft'
import * as React from 'react'
import { PageTest } from '@seagull/test-pages'

@suite('SecondsLeft')
export class SecondsLeftTest extends PageTest {
  Page = SecondsLeft
  @timeout(1000)
  @test.skip
  async 'can render page with initial 15 seconds'() {
    const seconds = 15
    this.mount({ data: { seconds } })
    this.page.text().should.contain('15 seconds')
    await this.update(1000)
    this.page.text().should.contain('14 seconds')
    await this.update(1000)
    this.page.text().should.contain('13 seconds')
    await this.update(1000)
    this.page.text().should.contain('12 seconds')
    await this.update(1000)
    this.page.text().should.contain('11 seconds')
    await this.update(1000)
    this.page.text().should.contain('10 seconds')
    await this.update(1000)
    this.page.text().should.contain('9 seconds')
    await this.update(1000)
    this.page.text().should.contain('8 seconds')
    await this.update(1000)
    this.page.text().should.contain('7 seconds')
    await this.update(1000)
    this.page.text().should.contain('6 seconds')
    await this.update(1000)
    this.page.text().should.contain('5 seconds')
    await this.update(1000)
    this.page.text().should.contain('4 seconds')
    await this.update(1000)
    this.page.text().should.contain('3 seconds')
    await this.update(1000)
    this.page.text().should.contain('2 seconds')
    await this.update(1000)
    this.page.text().should.contain('1 seconds')
    await this.update(1000)
    this.page.text().should.contain('AIDAnova')
  }
}

import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Tracking from '../../../lib/spa/tracking'
import * as mocks from '../../helper/mocks'

@suite('Frontend Tracking Module')
class TrackingUnitTest {
  before() {
    mocks.mockWindow()
    mocks.mockFetch()
  }

  after() {
    mocks.restoreWindow()
    mocks.restoreFetch()
  }

  @test
  async 'does not throw on the server'() {
    mocks.restoreWindow()
    mocks.restoreFetch()
    const tracking = new Tracking()
    expect(tracking).to.be.an('object')
    expect(tracking.id).to.be.equal('')
  }

  @test
  async 'can be initialized'() {
    const tracking = new Tracking()
    expect(tracking).to.be.an('object')
    expect(tracking.id).to.be.a('string')
    expect(tracking.id).to.be.not.equal('')
  }

  @test
  async 'can be statically called for referral event'() {
    expect(() => Tracking.trackReferral('twitter')).to.not.throw()
  }

  @test
  async 'can be statically called for revenue event'() {
    expect(() => Tracking.trackRevenue()).to.not.throw()
    expect(() => Tracking.trackRevenue({ id: '' })).to.not.throw()
  }
}

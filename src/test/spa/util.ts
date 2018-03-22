import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ReadOnlyConfig } from '../../lib/util'

@suite('ReadOnlyConfig')
class ReadOnlyConfigTest {
  @test
  async 'ReadOnlyConfig works (does not crash)'() {
    // tslint:disable-next-line:no-unused-expression
    ReadOnlyConfig.name.should.be.a('string')
    // tslint:disable-next-line:no-unused-expression
    ReadOnlyConfig.config.should.be.an('object')
  }

  @test
  async 'ReadOnlyConfig caches'() {
    const conf1 = ReadOnlyConfig.config
    const conf2 = ReadOnlyConfig.config
    conf1.should.be.equal(conf2)
  }

  @test
  async 'ReadOnlyConfig is mutable for testing'() {
    const gaConfig = ReadOnlyConfig.config.analytics
    ReadOnlyConfig.config.analytics = gaConfig
    ReadOnlyConfig.config.analytics = { ga: 'UA-23423', enabled: true }

    gaConfig.should.be.deep.equal(ReadOnlyConfig.config.analytics)
    gaConfig.should.not.be.equal(ReadOnlyConfig.config.analytics)
  }
}

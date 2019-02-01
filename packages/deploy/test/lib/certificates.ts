import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, suite, test, timeout } from 'mocha-typescript'
import {
  domainMatch,
  getExistingCert,
  isNotMatchedBy,
  makeAliasConfig,
  matchesDomains,
} from '../../src/lib/cdk/certificates'

@suite('CertificateSpecificTests')
export class Test extends BasicTest {
  @timeout(10000)
  @test
  'domainMatch works as expected'() {
    const match1 = domainMatch('sea.gull-api.sea.de')('*.gull-api.sea.de')
    match1.should.be.equal(true)
    const match2 = domainMatch('sea.gull-api.sea.de')('sea.gull-api.sea.de')
    match2.should.be.equal(true)
    const mismatch1 = domainMatch('sea.gull-api.sea.com')('*.gull-api.sea.de')

    mismatch1.should.be.equal(false)
    const mismatch2 = domainMatch('gull-api.sea.de')('*.gull-api.sea.de')
    mismatch2.should.be.equal(false)
    const mismatch3 = domainMatch('gull.api.sea.de')('*.gull-api.sea.de')
    mismatch3.should.be.equal(false)
  }
  @test
  'isNotMatchedBy works as expected'() {
    const schemata = ['www.sea.de', '*.gull-api.sea.de']
    isNotMatchedBy(schemata)('www.sea.de').should.be.equal(false)
    isNotMatchedBy(schemata)('www.sea.com').should.be.equal(true)
    isNotMatchedBy(schemata)('sea.gull-api.sea.de').should.be.equal(false)
    isNotMatchedBy(schemata)('gull-api.sea.de').should.be.equal(true)
    isNotMatchedBy(schemata)('gull.api.sea.de').should.be.equal(true)
  }
  @test
  'matchesDomains works as expected'() {
    const schemata = ['www.sea.de', '*.gull-api.sea.de']
    const match1 = matchesDomains(['sea.gull-api.sea.de', 'www.sea.de'])(
      schemata
    )
    match1.should.be.equal(true)
    const mismatch1 = matchesDomains(['www.sea.com', 'www.sea.de'])(schemata)
    mismatch1.should.be.equal(false)
    const mismatch2 = matchesDomains(['www.sea.de', 'www.sea.com'])(schemata)
    mismatch2.should.be.equal(false)
    matchesDomains(['gull-api.sea.de'])(schemata).should.be.equal(false)
    matchesDomains(['www.sea.de'])(schemata).should.be.equal(true)
    matchesDomains(['sea.gull-api.sea.de'])(schemata).should.be.equal(true)
    schemata.push('www2.sea.de')
    const match2 = matchesDomains(['www2.sea.de', 'www.sea.de'])(schemata)
    match2.should.be.equal(true)
    matchesDomains(['www.sea.de'])(schemata).should.be.equal(true)
  }
  @test.skip
  async 'getExistingCert works as expected'() {
    const noCert = await getExistingCert(['autobahn.aida.de'])
    expect(noCert).to.be.equal(undefined)
    const validCert = await getExistingCert(['myprettyface.cruise-api.aida.de'])
    validCert!.should.be.a('string')
    validCert!.length.should.be.greaterThan(0)
  }
  @test.skip
  async 'makeAliasConfig works as expected'() {
    const domains = ['myprettyface.cruise-api.aida.de']
    const aliasConf = await makeAliasConfig(domains)
    expect(aliasConf).to.haveOwnProperty('acmCertRef')
    expect(aliasConf!.acmCertRef.length).to.be.greaterThan(0)
    expect(aliasConf!.names).to.be.deep.equal(domains)
    const noAliasConf = await makeAliasConfig()
    expect(noAliasConf).to.be.equal(undefined)
  }
}

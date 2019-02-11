import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { getApiGatewayDomain, getApiGatewayPath } from '../../src'

@suite('HandleApiGatewayUrl')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can get id with protocol'() {
    const domain = 'bxvbshp4o7.execute-api.eu-central-1.amazonaws.com'
    const stage = 'prod'
    const url = `https://${domain}/${stage}`
    const result = getApiGatewayDomain(url)
    result.should.be.equal(domain)
  }

  @test
  async 'can get id without protocol'() {
    const domain = 'bxvbshp4o7.execute-api.eu-central-1.amazonaws.com'
    const stage = 'prod'
    const url = `${domain}/${stage}`
    const result = getApiGatewayDomain(url)
    result.should.be.equal(domain)
  }

  @test
  async 'can get path with slash at end'() {
    const id = 'bxvbshp4o7'
    const stage = 'prod'
    const url = `https://${id}.execute-api.eu-central-1.amazonaws.com/${stage}/`
    const result = getApiGatewayPath(url)
    result.should.be.equal(`/${stage}`)
  }

  @test
  async 'can get path without slash at end'() {
    const id = 'bxvbshp4o7'
    const stage = 'prod'
    const url = `https://${id}.execute-api.eu-central-1.amazonaws.com/${stage}`
    const result = getApiGatewayPath(url)
    result.should.be.equal(`/${stage}`)
  }
}

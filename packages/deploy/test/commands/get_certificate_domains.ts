import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test, timeout } from 'mocha-typescript'
import { GetCertificateDomains, GetRelevantCertList } from '../../src/commands'

@suite('GetCertificateDomains')
export class Test extends BasicTest {
  @timeout(10000)
  @test
  async 'can list certificate domains'() {
    const region = 'us-east-1'
    const certs = await new GetRelevantCertList(region).execute()
    // tslint:disable-next-line:no-console
    console.log(certs)
    certs.should.not.be.equal(undefined)
    certs.length.should.be.greaterThan(0)
    const domainNames = await new GetCertificateDomains(
      region,
      certs[0].CertificateArn!
    ).execute()
    // tslint:disable-next-line:no-console
    console.log(domainNames)
    domainNames.length.should.be.greaterThan(0)
    domainNames[0].should.be.a('string')
    domainNames[0].length.should.be.greaterThan(0)
  }
}

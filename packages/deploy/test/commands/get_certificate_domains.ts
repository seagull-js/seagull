import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test, timeout } from 'mocha-typescript'
import { GetCertificateDomains, GetRelevantCertList } from '../../src/commands'

@suite('GetCertificateDomains')
export class Test extends BasicTest {
  @timeout(10000)
  @test.skip
  async 'can list certificate domains'() {
    const region = 'us-east-1'
    const certs = await new GetRelevantCertList().execute()
    // tslint:disable-next-line:no-console
    console.log(certs)
    certs.should.not.be.equal(undefined)
    certs.length.should.be.greaterThan(0)
    const domains = await new GetCertificateDomains(
      certs[0].CertificateArn!
    ).execute()
    // tslint:disable-next-line:no-console
    console.log(domains)
    domains.length.should.be.greaterThan(0)
    domains[0].should.be.a('string')
    domains[0].length.should.be.greaterThan(0)
  }
}

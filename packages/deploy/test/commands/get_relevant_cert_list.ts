import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, suite, test, timeout } from 'mocha-typescript'
import { GetRelevantCertList } from '../../src/commands'

@suite('GetRelevantCertList')
export class Test extends BasicTest {
  @timeout(10000)
  @test
  async 'can list certificates'() {
    const certs = await new GetRelevantCertList('eu-central-1').execute()
    // tslint:disable-next-line:no-console
    console.log(certs)
    certs.should.not.be.equal(undefined)
    certs.length.should.be.greaterThan(0)
  }
}

import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ISoapClient, ISoapResponse } from '../../src'
import { SoapClientSupplier } from '../../src/mode/cloud'

type ExpectedResponse = { AddResult: number } & ISoapResponse
type ExpectedClient = ISoapClient & {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Mode::Cloud')
export class Test extends BasicTest {
  soap = new SoapClientSupplier()
  wsdlPath = 'http://www.dneonline.com/calculator.asmx?wsdl'

  @test
  @timeout(5000)
  async 'can get result'() {
    // delete old fixture
    const path = './seed/https/www.dneonline.com/calculator.asmx?'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    // seed fixture
    const seedClient = await this.soap.getClient<ExpectedClient>({
      wsdlPath: this.wsdlPath,
    })
    const params = { intA: 3, intB: 5 }
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse.AddResult).to.eq(8)
  }
}

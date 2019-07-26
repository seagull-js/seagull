import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Client } from 'soap'
import { SoapClientSupplier } from '../src/mode/cloud'

interface ExpectedClient extends Client {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

type ExpectedResponse = { AddResult: number }

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Cloud::Fetch')
export class Test extends BasicTest {
  soap = new SoapClientSupplier()
  baseUrl = 'http://www.dneonline.com/calculator.asmx'
  wsdlUrl = `${this.baseUrl}?wsdl`

  @test
  async 'can get soap response'() {
    // delete old fixture
    const path = './seed/https/www.dneonline.com/calculator.asmx?'
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    // seed fixture
    const params = {
      intA: 3,
      intB: 5,
    }
    const seedClient = await this.soap.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse.AddResult).to.eq(8)
  }
}

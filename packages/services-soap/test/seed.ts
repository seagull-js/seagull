import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import * as fs from 'fs'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Client } from 'soap'
import { SoapClientSupplierPure } from '../src/mode/pure'
import { SoapClientSupplierSeed } from '../src/mode/seed'

type ExpectedResponse = [
  {
    AddResult: number
  },
  string,
  undefined,
  string
]

interface ExpectedClient extends Client {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

@suite('Soap::Seed::Request')
export class Test extends BasicTest {
  soapSeed = new SoapClientSupplierSeed()
  soapPure = new SoapClientSupplierPure()
  baseUrl = 'http://www.dneonline.com/calculator.asmx'
  wsdlUrl = `${this.baseUrl}?wsdl`

  @test
  async 'can get seed fixture'() {
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
    console.info('step1')
    const seedClient = await this.soapSeed.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    console.info('step2')
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse[0].AddResult).to.eq(8)
    console.info('step3')

    // get fixture
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })

    console.info('step4')
    const pureResponse = await pureClient.AddAsync(params)
    expect(pureResponse[0].AddResult).to.eq(8)
  }
}

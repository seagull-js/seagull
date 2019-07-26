// tslint:disable: no-unused-expression
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

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Seed::Request')
export class Test extends BasicTest {
  soapSeed = new SoapClientSupplierSeed()
  soapPure = new SoapClientSupplierPure()
  protocol = 'http'
  basePath = 'www.dneonline.com/calculator.asmx'
  baseUrl = `${this.protocol}://${this.basePath}`
  wsdlUrl = `${this.baseUrl}?wsdl`
  functionHash = '15e66e975bb36c02ae5b4afc5a5d9ec7'

  @test
  async 'can get seed fixture'() {
    // delete old fixture
    const path = `./seed/${this.protocol}/${this.basePath}?wsdl/AddAsync/${
      this.functionHash
    }.json`
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    // seed fixture
    const params = {
      intA: 3,
      intB: 5,
    }
    const seedClient = await this.soapSeed.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse[0].AddResult).to.eq(8)

    expect(fs.existsSync(path), 'fixture file not found').to.be.true

    // get fixture
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })

    const pureResponse = await pureClient.AddAsync(params)
    expect(pureResponse[0].AddResult).to.eq(8)
  }
}

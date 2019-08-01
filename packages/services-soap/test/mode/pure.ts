// tslint:disable: no-unused-expression
import { SeedError } from '@seagull/seed'
import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ISoapClient, ISoapResponse } from '../../src'
import { SoapClientSupplierPure } from '../../src/mode/pure'
use(promisedChai)

type ExpectedResponse = { AddResult: number } & ISoapResponse
type ExpectedClient = ISoapClient & {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

@suite('Soap::Pure')
export class Test extends BasicTest {
  soapPure = new SoapClientSupplierPure()
  wsdl = 'www.dneonline.com/calculator.asmx?wsdl'
  wsdlPath = `http/${this.wsdl}`
  wsdlUrl = `http://${this.wsdl}`
  hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'

  @test
  async 'can get result'() {
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const params = { intA: 3, intB: 5 }
    const seedResponse = await pureClient.AddAsync(params)

    expect(seedResponse.AddResult).to.eq(8)
  }

  @test
  async 'throws error when seed is not available'() {
    // delete old fixture
    const path = `./seed/${this.wsdlPath}/AddAsync/${this.hash}.json`
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    expect(fs.existsSync(path), `${path} should not exist`).to.be.false

    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const params = { intA: 3, intB: 5 }
    const pureRequest = pureClient.AddAsync(params)

    await expect(pureRequest).to.be.rejectedWith(SeedError)
  }
}

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

@suite('Soap::Mode::Pure')
export class Test extends BasicTest {
  static endpoint = `www.dneonline.com/calculator.asmx`
  static endpointPath = `http://${Test.endpoint}`
  static wsdlPath = `${Test.endpointPath}?wsdl`
  static hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'
  static wsdlFilePath = `./seed/http/${Test.endpoint}`
  static seedFilePath = `${Test.wsdlFilePath}/AddAsync/${Test.hash}.json`

  soapPure = new SoapClientSupplierPure()

  @test
  async 'has valid endpoint'() {
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })

    expect(pureClient.endpoint).to.be.equal(Test.endpointPath)
  }

  @test
  async 'can get result'() {
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const params = { intA: 3, intB: 5 }
    const seedResponse = await pureClient.AddAsync(params)

    expect(seedResponse.AddResult).to.eq(8)
  }

  @test
  async 'throws error when seed is not available'() {
    // delete old fixture
    if (fs.existsSync(Test.seedFilePath)) {
      fs.unlinkSync(Test.seedFilePath)
    }

    expect(
      fs.existsSync(Test.seedFilePath),
      `${Test.seedFilePath} should not exist`
    ).to.be.false

    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const params = { intA: 3, intB: 5 }
    const pureRequest = pureClient.AddAsync(params)

    await expect(pureRequest).to.be.rejectedWith(SeedError)
  }
}

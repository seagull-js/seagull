// tslint:disable: no-unused-expression
import { ServiceTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ISoapClient, ISoapResponse } from '../../src'
import { SoapClientSupplierPure } from '../../src/mode/pure'
import { SoapClientSupplierSeed } from '../../src/mode/seed'

type ExpectedResponse = { AddResult: number } & ISoapResponse
type ExpectedClient = ISoapClient & {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

const rem = (path: string) => fs.existsSync(path) && fs.unlinkSync(path)

@suite('Soap::Mode::State')
export class Test extends ServiceTest {
  static endpoint = `www.dneonline.com/calculator.asmx`
  static endpointPath = `http://${Test.endpoint}`
  static wsdlPath = `${Test.endpointPath}?wsdl`
  static hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'
  static wsdlFilePath = `./seed/http/${Test.endpoint}`
  static seedFilePath = `${Test.wsdlFilePath}/AddAsync/${Test.hash}.json`
  static path = (testNameSlug: string, idx: number) =>
    `${Test.wsdlFilePath}/AddAsync/${Test.hash}` +
    `/suite-soapmodestate/${testNameSlug}/request-${idx}.json`

  serviceModules = []
  services = [SoapClientSupplierPure, SoapClientSupplierSeed]
  stateful = true

  @test
  async 'can create stateful seed fixture'() {
    const slug = 'can-create-stateful-seed-fixture'
    const soapSeed = this.injector.get(SoapClientSupplierSeed)
    const seedClient = await soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const params = { intA: 3, intB: 5 }

    // delete old fixtures
    rem(Test.path(slug, 0))
    rem(Test.path(slug, 1))

    // seed fixture 0
    const seedResponse0 = await seedClient.AddAsync(params)
    expect(seedResponse0.AddResult).to.eq(8)
    expect(
      fs.existsSync(Test.path(slug, 0)),
      `fixture 0 file not found: ${Test.path(slug, 0)}`
    ).to.be.true

    // seed fixture 1
    const seedResponse1 = await seedClient.AddAsync(params)
    expect(seedResponse1.AddResult).to.eq(8)
    expect(
      fs.existsSync(Test.path(slug, 1)),
      `fixture 1 file not found: ${Test.path(slug, 1)}`
    ).to.be.true
  }

  @test
  async 'can get stateful seed fixture'() {
    const slug = 'can-get-stateful-seed-fixture'
    const path = Test.path(slug, 0)

    // delete old fixtures
    rem(Test.path(slug, 0))

    const params = { intA: 3, intB: 5 }

    // seed fixture 0
    const soapSeed = this.injector.get(SoapClientSupplierSeed)
    const seedClient = await soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse.AddResult).to.eq(8)
    expect(
      fs.existsSync(Test.path(slug, 0)),
      `fixture 0 file not found: ${Test.path(slug, 0)}`
    ).to.be.true

    // get fixture 0
    const soapPure = this.injector.get(SoapClientSupplierPure)
    const pureClient = await soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const pureResponse = await pureClient.AddAsync(params)
    expect(pureResponse.AddResult).to.eq(8)
  }
}

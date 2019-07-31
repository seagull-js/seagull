// tslint:disable: no-unused-expression
import { ServiceTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as querystring from 'querystring'
import * as rimraf from 'rimraf'
import { Client } from 'soap'
import { SoapClientSupplierPure } from '../../src/mode/pure'
import { SoapClientSupplierSeed } from '../../src/mode/seed'

type ExpectedResponse = { AddResult: number }

interface ExpectedClient extends Client {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

@suite('Soap::Mode::State')
export class Test extends ServiceTest {
  static hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'
  static wsdl = 'www.dneonline.com/calculator.asmx?wsdl'
  static wsdlPath = `http/${Test.wsdl}`
  static wsdlUrl = `http://${Test.wsdl}`
  static seedPath = `./seed/${Test.wsdlPath}/AddAsync/${Test.hash}`
  static path = (testNameSlug: string, idx: number) =>
    `${Test.seedPath}/suite-soapmodestate/${testNameSlug}/request-${idx}.json`

  static after() {
    rimraf.sync(Test.seedPath)
  }

  serviceModules = []
  services = [SoapClientSupplierPure, SoapClientSupplierSeed]
  stateful = true

  @test
  async 'can create stateful seed fixture'() {
    const slug = 'can-create-stateful-seed-fixture'
    const soapSeed = this.injector.get(SoapClientSupplierSeed)
    const seedClient = await soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlUrl,
    })
    const params = { intA: 3, intB: 5 }

    // seed should be empty
    expect(fs.existsSync(Test.path(slug, 0))).to.be.false
    expect(fs.existsSync(Test.path(slug, 1))).to.be.false

    // seed fixture 0
    const seedResponse0 = await seedClient.AddAsync(params)
    expect(seedResponse0.AddResult).to.eq(8)
    expect(fs.existsSync(Test.path(slug, 0)), `fixture 0 file not found`).to.be
      .true

    // seed fixture 1
    const seedResponse1 = await seedClient.AddAsync(params)
    expect(seedResponse1.AddResult).to.eq(8)
    expect(fs.existsSync(Test.path(slug, 1)), `fixture 1 file not found`).to.be
      .true
  }

  @test
  async 'can get stateful seed fixture'() {
    const slug = 'can-get-stateful-seed-fixture'
    const path = Test.path(slug, 0)

    // seed should be empty
    expect(fs.existsSync(path)).to.be.false

    const params = { intA: 3, intB: 5 }

    // seed fixture 0
    const soapSeed = this.injector.get(SoapClientSupplierSeed)
    const seedClient = await soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlUrl,
    })
    const seedResponse = await seedClient.AddAsync(params)
    expect(seedResponse.AddResult).to.eq(8)
    expect(fs.existsSync(Test.path(slug, 0)), `fixture 0 file not found`).to.be
      .true

    // get fixture 0
    const soapPure = this.injector.get(SoapClientSupplierPure)
    const pureClient = await soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlUrl,
    })
    const pureResponse = await pureClient.AddAsync(params)
    expect(pureResponse.AddResult).to.eq(8)
  }
}

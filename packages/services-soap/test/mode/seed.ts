// tslint:disable: no-unused-expression
import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import * as fs from 'fs'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ISoapClient, ISoapResponse } from '../../src'
import { SoapClientSupplierPure } from '../../src/mode/pure'
import { SoapClientSupplierSeed } from '../../src/mode/seed'
use(promisedChai)

type ExpectedResponse = { AddResult: number } & ISoapResponse
type ExpectedClient = ISoapClient & {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Mode::Seed')
export class Test extends BasicTest {
  soapSeed = new SoapClientSupplierSeed()
  soapPure = new SoapClientSupplierPure()
  wsdl = 'www.dneonline.com/calculator.asmx?wsdl'
  wsdlPath = `http/${this.wsdl}`
  wsdlUrl = `http://${this.wsdl}`
  hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'

  @test
  async 'can seed fixture result'() {
    // delete old fixture
    const path = `./seed/${this.wsdlPath}/AddAsync/${this.hash}.json`
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }

    expect(fs.existsSync(path), `${path} should not exist`).to.be.false

    // seed fixture
    const seedClient = await this.soapSeed.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const params = { intA: 3, intB: 5 }
    const seedResponse = await seedClient.AddAsync(params)

    expect(seedResponse.AddResult).to.eq(8)

    // get fixture
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: this.wsdlUrl,
    })
    const pureResponse = await pureClient.AddAsync(params)

    expect(fs.existsSync(path), `fixture ${path} not found!`).to.be.true
    expect(pureResponse.AddResult).to.eq(8)
  }
}

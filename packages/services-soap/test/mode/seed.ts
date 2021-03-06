// tslint:disable: no-unused-expression
import { FixtureStorage as FxSt } from '@seagull/seed'
import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import * as fs from 'fs'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { ISoapClient, ISoapResponse } from '../../src'
import { SoapFaultError } from '../../src/error'
import { SoapClientSupplierPure } from '../../src/mode/pure'
import { SoapClientSupplierSeed } from '../../src/mode/seed'
use(promisedChai)

type ExpectedResponse = { AddResult: number } & ISoapResponse
type ExpectedClient = ISoapClient & {
  AddAsync: (x: any) => Promise<ExpectedResponse>
}

const rem = (path: string) => fs.existsSync(path) && fs.unlinkSync(path)

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Mode::Seed')
export class Test extends BasicTest {
  static endpoint = `www.dneonline.com/calculator.asmx`
  static endpointPath = `http://${Test.endpoint}`
  static wsdlPath = `${Test.endpointPath}?wsdl`
  static hash = '15e66e975bb36c02ae5b4afc5a5d9ec7'
  static wsdlFilePath = `./seed/http/${Test.endpoint}`
  static seedFilePath = `${Test.wsdlFilePath}/AddAsync/${Test.hash}.json`
  static faultyHash = 'a4e5dd6a0a52fbba967140256a0b05b0'
  static faultySeedFilePath = `${Test.wsdlFilePath}/AddAsync/${
    Test.faultyHash
  }.json`

  soapSeed = new SoapClientSupplierSeed()
  soapPure = new SoapClientSupplierPure()

  @test
  async 'has valid endpoint'() {
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })

    expect(pureClient.endpoint).to.be.equal(Test.endpointPath)
  }

  @test
  async 'can seed fixture result'() {
    // delete old fixture
    rem(Test.seedFilePath)

    expect(
      fs.existsSync(Test.seedFilePath),
      `${Test.seedFilePath} should not exist`
    ).to.be.false

    // seed fixture
    const seedClient = await this.soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const params = { intA: 3, intB: 5 }
    const seedResponse = await seedClient.AddAsync(params)

    expect(seedResponse.AddResult).to.eq(8)

    // get fixture
    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    })
    const pureResponse = await pureClient.AddAsync(params)

    expect(
      fs.existsSync(Test.seedFilePath),
      `fixture ${Test.seedFilePath} not found!`
    ).to.be.true
    expect(pureResponse.AddResult).to.eq(8)
  }

  @test
  async 'can use different endpoint'() {
    // delete old fixture
    rem(Test.seedFilePath)

    const clientOptions = {
      endpoint: Test.endpointPath,
      wsdlPath: './test/data/endpoint.wsdl',
    }
    const client = await this.soapSeed.getClient<ExpectedClient>(clientOptions)
    const params = { intA: 3, intB: 5 }
    const response = await client.AddAsync(params)
    expect(client.endpoint).to.be.equal(Test.endpointPath)
    expect(response.AddResult).to.eq(8)

    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      endpoint: Test.endpointPath,
      wsdlPath: Test.wsdlPath,
    })
    const pureResponse = await pureClient.AddAsync(params)

    expect(client.endpoint).to.be.equal(Test.endpointPath)
    expect(
      fs.existsSync(Test.seedFilePath),
      `fixture ${Test.seedFilePath} not found!`
    ).to.be.true
    expect(pureResponse.AddResult).to.eq(8)
  }

  @test
  @timeout(5000)
  @only
  async 'keeps fixture when existing'() {
    const params = { intA: 99, intB: 99 }
    const noUpdateHash = '2073298ff3aed7e3fe042bd70146d62e'
    const noUpdatePath = `${Test.wsdlFilePath}/AddAsync/${noUpdateHash}.json`

    expect(fs.existsSync(noUpdatePath), `expected ${noUpdatePath} to exist`).to
      .be.true

    const comparable = (x: Date) => x.toISOString().substring(0, 16)
    const modifiedCompare = comparable(new Date())

    const wsdlSeed = FxSt.createByWsdlUrl<string>(Test.wsdlPath)
    const wsdlModified = wsdlSeed.modifiedDate

    const endpointFunctionUrl = `${Test.endpointPath}/AddAsync`
    const funcSeed = FxSt.createByUrl<string>(endpointFunctionUrl, params)
    const seedModified = funcSeed.modifiedDate

    const client = await this.soapSeed.getClient<ExpectedClient>({
      endpoint: Test.endpointPath,
      wsdlPath: Test.wsdlPath,
    })

    await client.AddAsync(params)

    expect(wsdlSeed.modifiedDate).to.be.a('Date')
    expect(modifiedCompare).not.to.eq(comparable(wsdlModified!))
    expect(funcSeed.modifiedDate).to.be.a('Date')
    expect(modifiedCompare).not.to.eq(comparable(seedModified!))
  }

  @test
  @timeout(5000)
  async 'creates fixture in case of an error'() {
    rem(Test.faultySeedFilePath) // delete old fixture

    expect(
      fs.existsSync(Test.faultySeedFilePath),
      `expected ${Test.faultySeedFilePath} to not exist`
    ).to.be.false

    const seedClient = await this.soapSeed.getClient<ExpectedClient>({
      wsdlPath: Test.wsdlPath,
    }) // seed fixture

    const params = { intA: '?', intB: '?' }
    const seedRequest = seedClient.AddAsync(params)

    await expect(seedRequest).to.be.rejectedWith(SoapFaultError)
    expect(
      fs.existsSync(Test.faultySeedFilePath),
      `expected ${Test.faultySeedFilePath} to exist`
    ).to.be.true

    const pureClient = await this.soapPure.getClient<ExpectedClient>({
      endpoint: Test.endpointPath,
      wsdlPath: Test.wsdlPath,
    })
    const pureRequest = pureClient.AddAsync(params)
    await expect(pureRequest).to.be.rejectedWith(SoapFaultError)
  }
}

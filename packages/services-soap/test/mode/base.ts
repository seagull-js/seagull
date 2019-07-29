import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript'
import { BasicAuthSecurity, Client } from 'soap'
import { SoapClientSupplier } from '../../src/mode/cloud'

// TODO: Mock outgoing test requests via Http-Mock like yakbak
@suite('Soap::Mode::Base')
export class Test extends BasicTest {
  supplier = new SoapClientSupplier()

  @test
  async 'returns a soap client'() {
    const clientOptions = { wsdlPath: './test/data/example.wsdl' }
    const client = await this.supplier.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.endpoint).to.be.equal(clientOptions.wsdlPath)
  }

  @test
  async 'returns a soap client with authentication'() {
    const credentials = { username: 'banana39', password: '12345' }
    const clientOptions = { wsdlPath: './test/data/example.wsdl', credentials }
    const client = await this.supplier.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.security).to.be.deep.equal(
      new BasicAuthSecurity(credentials.username, credentials.password)
    )
  }

  @test
  async 'returns a soap client with a different endpoint'() {
    const endpoint = '/shananana'
    const clientOptions = { wsdlPath: './test/data/example.wsdl', endpoint }
    const client = await this.supplier.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.endpoint).to.be.equal(endpoint)
  }
}

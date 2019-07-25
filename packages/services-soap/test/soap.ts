import { expect } from 'chai'
import { suite, test, timeout } from 'mocha-typescript'
import { BasicAuthSecurity } from 'soap'
import { ClientOptions } from '../src'
import { SoapClientSupplier } from '../src/mode/cloud'
import { SoapClientSupplierSeed } from '../src/mode/seed'

// tslint:disable-next-line:no-var-requires
@suite('SOAP::IBE')
class SoapClientSupplierTest {
  @test
  async 'returns a soap client'() {
    const clientProvider = new SoapClientSupplier()
    const clientOptions = { wsdlPath: './test/example.wsdl' }
    const client = await clientProvider.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.endpoint).to.be.equal(clientOptions.wsdlPath)
  }
  @timeout(50000)
  @test
  async 'Seeding works'() {
    const clientProvider = new SoapClientSupplierSeed()
    const clientOptions = {
      credentials: { username: 'proxyuser', password: '4kmLfk2j4?' },
      wsdlPath: 'https://test-pluto.cruise-api.aida.de/ibe/engine/v2?wsdl',
    }
    const client = await clientProvider.getClient(clientOptions)
    console.info(
      await (client.findStationsAsync as (a: any) => Promise<any>)({
        findStationsRequest: { name: 'Münch' },
      })
    )
  }

  @test
  async 'returns a soap client with authentication'() {
    const clientProvider = new SoapClientSupplier()
    const credentials = { username: 'banana39', password: '12345' }
    const clientOptions = { wsdlPath: './test/example.wsdl', credentials }
    const client = await clientProvider.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.security).to.be.deep.equal(
      new BasicAuthSecurity(credentials.username, credentials.password)
    )
  }

  @test
  async 'returns a soap client with a different endpoint'() {
    const clientProvider = new SoapClientSupplier()
    const endpoint = '/shananana'
    const clientOptions = { wsdlPath: './test/example.wsdl', endpoint }
    const client = await clientProvider.getClient(clientOptions)
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
    expect(client.endpoint).to.be.equal(endpoint)
  }
}

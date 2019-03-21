import { expect } from 'chai'
import { suite, test } from 'mocha-typescript'
import { SoapClientSupplier } from '../src'

// tslint:disable-next-line:no-var-requires
@suite('SOAP::IBE')
class SoapClientSupplierTest {
  @test
  async 'returns a soap client'() {
    const clientProvider = new SoapClientSupplier()
    const client = await clientProvider.getClient('./test/example.wsdl', '', '')
    expect(client).to.haveOwnProperty('sayHello')
    expect(client).to.haveOwnProperty('sayHelloAsync')
  }
}

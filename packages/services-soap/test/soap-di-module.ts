import { expect } from 'chai'
import { Container } from 'inversify'
import { suite, test } from 'mocha-typescript'
import 'reflect-metadata'
import { soapDIModule } from '../src'
import { SoapClientSupplier } from '../src/mode/cloud'

// tslint:disable-next-line:no-var-requires
@suite('SOAP::IBE')
class SoapDIModuleTest {
  @test
  async 'can be loaded by injector'() {
    const injector = new Container()
    injector.load(soapDIModule)
    // tslint:disable-next-line:no-unused-expression
    expect(injector.isBound(SoapClientSupplier)).to.be.true
    expect(injector.get(SoapClientSupplier)).to.be.instanceOf(
      SoapClientSupplier
    )
  }
  async 'can be unloaded by injector'() {
    const injector = new Container()
    injector.load(soapDIModule)
    injector.unload(soapDIModule)
    // tslint:disable-next-line:no-unused-expression
    expect(injector.isBound(SoapClientSupplier)).to.be.true
    expect(() => injector.get(SoapClientSupplier)).to.throw()
  }
}

import { expect } from 'chai'
import { Container } from 'inversify'
import { suite, test } from 'mocha-typescript'
import 'reflect-metadata'
import { SoapClientSupplier } from '../src/soap'
import { SoapDIModule } from '../src/soap-di-module'

// tslint:disable-next-line:no-var-requires
@suite('SOAP::IBE')
class SoapDIModuleTest {
  @test
  async 'can be loaded by injector'() {
    const injector = new Container()
    injector.load(SoapDIModule)
    // tslint:disable-next-line:no-unused-expression
    expect(injector.isBound(SoapClientSupplier)).to.be.true
    expect(injector.get(SoapClientSupplier)).to.be.instanceOf(
      SoapClientSupplier
    )
  }
  async 'can be unloaded by injector'() {
    const injector = new Container()
    injector.load(SoapDIModule)
    injector.unload(SoapDIModule)
    // tslint:disable-next-line:no-unused-expression
    expect(injector.isBound(SoapClientSupplier)).to.be.true
    expect(() => injector.get(SoapClientSupplier)).to.throw()
  }
}

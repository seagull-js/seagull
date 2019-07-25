import { ContainerModule } from 'inversify'
import { SoapClientSupplier } from './soap'

export const soapDIModule = new ContainerModule(bind => {
  bind<SoapClientSupplier>(SoapClientSupplier).toSelf()
})

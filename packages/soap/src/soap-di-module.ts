import { ContainerModule } from 'inversify'
import { SoapClientSupplier } from './soap'

export const SoapDIModule = new ContainerModule(bind => {
  bind<SoapClientSupplier>(SoapClientSupplier).toSelf()
})

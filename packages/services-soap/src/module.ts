import { Mode } from '@seagull/mode'
import { config } from '@seagull/seed'
import { ContainerModule, interfaces } from 'inversify'
import { SoapClientSupplier } from './mode/cloud'
import { SoapClientSupplierPure } from './mode/pure'
import { SoapClientSupplierSeed } from './mode/seed'

export const soapDIModule = new ContainerModule(bind => {
  bind<SoapClientSupplier>(SoapClientSupplier).toSelf()
})

export const module = new ContainerModule((bind: interfaces.Bind) => {
  bind(SoapClientSupplier)
    .toSelf()
    .when(
      () =>
        Mode.environment === 'cloud' ||
        Mode.environment === 'connected' ||
        Mode.environment === 'edge'
    )
  bind(SoapClientSupplier)
    .to(SoapClientSupplierPure)
    .when(() => Mode.environment === 'pure' && !config.seed)
  bind(SoapClientSupplier)
    .to(SoapClientSupplierSeed)
    .when(() => Mode.environment === 'pure' && config.seed)
})

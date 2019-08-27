import { SoapClientSupplier } from './mode/cloud'

// types
export * from './interface'
export * from './module'
export * from './error'

// services
export { SoapClientSupplier }
export { SoapClientSupplier as SoapClientSupplierCloud }
export { SoapClientSupplierPure } from './mode/pure'
export { SoapClientSupplierSeed } from './mode/seed'

// service container module
export { module as soapServicesModule } from './module'

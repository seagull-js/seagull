import { injectable } from 'inversify'
import 'reflect-metadata'
import { SoapClientSupplierBase } from './base'

/**
 * Soap client supplier (default) cloud mode implementation.
 */
@injectable()
export class SoapClientSupplier extends SoapClientSupplierBase {
  getClient = this.getClientInternal
}

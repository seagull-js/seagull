import { Fixture, FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions } from '..'
import { SoapClientSupplierBase } from './base'

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const client = this.getClientInternal(options)
    // TODO: replace client generated functions with adapter doint the request and replacing the fixture
    throw new Error('not implemented')
  }
}

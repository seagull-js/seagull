import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions } from '..'
import { SoapClientSupplierBase } from './base'

/**
 * Soap client supplier pure mode implementation.
 */
@injectable()
export class SoapClientSupplierPure extends SoapClientSupplierBase {
  getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const client = this.getClientInternal(options)
    // TODO: replace client generated functions with adapter doing something like:
    // const seed = FixtureStorage.createByFetchParams<Fixture<any>>(url, init)
    // const fixture = seed.get()
    throw new Error('not implemented')
  }
}

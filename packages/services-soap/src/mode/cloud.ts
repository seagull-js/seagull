import { injectable } from 'inversify'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions } from '..'
import { ClientFunction, createProxy, SoapClientSupplierBase } from './base'

/**
 * Soap client supplier (default) cloud mode implementation.
 */
@injectable()
export class SoapClientSupplier extends SoapClientSupplierBase {
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const client = await this.getClientInternal<T>(options)
    const cloudify = (fnc: ClientFunction, name: string, args: any) => fnc(args)
    const cloudClient = await createProxy<T>(client, cloudify)
    return cloudClient
  }
}

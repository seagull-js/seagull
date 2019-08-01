import { injectable } from 'inversify'
import 'reflect-metadata'
import { ClientOptions, ISoapClient } from '..'
import { SoapError } from '../error'
import {
  ClientFunction,
  createProxy,
  getClientInternal,
  SoapClientSupplierBase,
} from './base'

/**
 * Soap client supplier (default) cloud mode implementation.
 */
@injectable()
export class SoapClientSupplier extends SoapClientSupplierBase {
  /**
   * Creates a SOAP cloud mode client.
   * @param options client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(options: ClientOptions): Promise<T> {
    try {
      const client = await getClientInternal<T>(options)
      const cloudify = (fnc: ClientFunction, _: string, args: any) => {
        try {
          return fnc(args)
        } catch (e) {
          throw new SoapError(`Error calling function '${name}'.`, e)
        }
      }
      const cloudClient = await createProxy<T>(client, cloudify)
      return cloudClient
    } catch (e) {
      throw new SoapError('Unable to create cloud mode client', e)
    }
  }
}

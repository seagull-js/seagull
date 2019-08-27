import { injectable } from 'inversify'
import 'reflect-metadata'
import { SoapError } from '../error'
import { ClientOptions, ISoapClient } from '../interface'
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
   * @param opts client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(opts: ClientOptions): Promise<T> {
    try {
      const client = await getClientInternal<T>(opts)
      return await cloudifyClient<T>(client)
    } catch (e) {
      throw new SoapError(`Unable to create cloud mode client: ${e.message}`, e)
    }
  }
}

const cloudifyClient = async <T extends ISoapClient>(client: T) => {
  const cloudify = (fnc: ClientFunction, _: string, args: any) => {
    try {
      return fnc(args)
    } catch (e) {
      throw new SoapError(`Error calling '${name}': ${e.message}`, e)
    }
  }
  return await createProxy(client, cloudify, true)
}

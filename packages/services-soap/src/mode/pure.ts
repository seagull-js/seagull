import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions } from '..'
import { SoapError } from '../error'
import { ClientFunction, createProxy, SoapClientSupplierBase } from './base'

const purifyClient = async <T extends soap.Client>(
  client: T,
  wsdlPath: string
) => {
  const purify = async (fnc: ClientFunction, name: string, args: any) =>
    FixtureStorage.createByUrl(`${wsdlPath}/${name}`, args).get()
  return await createProxy(client, purify)
}

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierPure extends SoapClientSupplierBase {
  /**
   * Creates a SOAP pure mode client.
   * @param options client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    try {
      const wsdlPath = `seed/${options.wsdlPath}.wsdl`.replace('://', '/')
      const endpoint = options.endpoint || options.wsdlPath
      const opts = { endpoint, wsdlPath, credentials: options.credentials }
      const client = await this.getClientInternal<T>(opts)
      const pureClient = await purifyClient<T>(client, options.wsdlPath)
      return pureClient
    } catch (e) {
      throw new SoapError('Unable to create pure mode client.', e)
    }
  }
}

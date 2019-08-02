import { FixtureStorage, SeedError } from '@seagull/seed'
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
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierPure extends SoapClientSupplierBase {
  /**
   * Creates a SOAP pure mode client.
   * @param options client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(options: ClientOptions): Promise<T> {
    try {
      const wsdlPath = `seed/${options.wsdlPath}.wsdl`.replace('://', '/')
      const endpoint = options.endpoint || options.wsdlPath
      const opts = { endpoint, wsdlPath, credentials: options.credentials }
      const client = await getClientInternal<T>(opts)
      const pureClient = await this.purifyClient<T>(client, options.wsdlPath)
      return pureClient
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new SeedError('WSDL Fixture (seed) is missing.')
      }
      throw new SoapError('Unable to create pure mode client.', e)
    }
  }

  private async purifyClient<T extends ISoapClient>(
    client: T,
    wsdlPath: string
  ) {
    const purify = async (fnc: ClientFunction, name: string, args: any) =>
      FixtureStorage.createByUrl(
        `${wsdlPath}/${name}`,
        args,
        this.testScope
      ).get()
    return await createProxy(client, purify, true)
  }
}

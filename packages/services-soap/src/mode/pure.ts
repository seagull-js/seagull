import { FixtureStorage, SeedError } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { ClientOptions, ISoapClient } from '..'
import { SoapError } from '../error'
import {
  ClientFunction,
  createProxy,
  getClientInternal,
  getEndpoint,
  SoapClientSupplierBase,
} from './base'

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierPure extends SoapClientSupplierBase {
  /**
   * Creates a SOAP pure mode client.
   * @param opts client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(opts: ClientOptions): Promise<T> {
    const endpoint = getEndpoint(opts)
    const wsdlPath = `seed/${endpoint}.wsdl`.replace('://', '/')
    const options = { endpoint, wsdlPath, credentials: opts.credentials }
    try {
      const client = await getClientInternal<T>(options)
      const pureClient = await this.purifyClient<T>(client, endpoint)
      return pureClient
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new SeedError(`Fixture (seed) WSDL is missing: ${wsdlPath}`)
      }
      throw new SoapError(`Unable to create pure mode client: ${e.message}`, e)
    }
  }

  private async purifyClient<T extends ISoapClient>(
    client: T,
    endpoint: string
  ) {
    const purify = async (fnc: ClientFunction, name: string, args: any) =>
      FixtureStorage.createByUrl(
        `${endpoint}/${name}`,
        args,
        this.testScope
      ).get()
    return await createProxy(client, purify, true)
  }
}

import { FixtureStorage, SeedError } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { SoapError } from '../error'
import { ClientOptions, ISoapClient, ISoapResponse } from '../interface'
import {
  ClientFunction,
  createProxy,
  getClientInternal,
  getEndpoint,
  SoapClientSupplierBase,
} from './base'
import { handleSeedError } from './seed'

/**
 * Soap client supplier pure mode implementation.
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
      return await this.purifyClient<T>(client, endpoint)
    } catch (e) {
      throw e.code === 'ENOENT'
        ? new SeedError(`Fixture (seed) WSDL is missing: ${wsdlPath}`, e)
        : new SoapError(`Unable to create pure mode client: ${e.message}`, e)
    }
  }

  private async purifyClient<T extends ISoapClient>(
    client: T,
    endpoint: string
  ) {
    const purify = async (_: ClientFunction, name: string, args: any) => {
      const seed = FixtureStorage.createByUrl<ISoapResponse>(
        `${endpoint}/${name}`,
        args,
        this.testScope
      )
      const response = seed.get()
      handleSeedError(response)
      return response
    }
    return await createProxy(client, purify, true)
  }
}

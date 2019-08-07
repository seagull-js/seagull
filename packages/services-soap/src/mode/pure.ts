import { FixtureStorage, SeedError } from '@seagull/seed'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { ClientOptions, ISoapClient, ISoapResponse } from '..'
import { SoapError, SoapFaultError } from '../error'
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
        throw new SeedError(`Fixture (seed) WSDL is missing: ${wsdlPath}`, e)
      }
      throw new SoapError(`Unable to create pure mode client: ${e.message}`, e)
    }
  }

  private async purifyClient<T extends ISoapClient>(
    client: T,
    endpoint: string
  ) {
    const purify = async (fnc: ClientFunction, name: string, args: any) => {
      const fixSt = FixtureStorage.createByUrl<ISoapResponse>(
        `${endpoint}/${name}`,
        args,
        this.testScope
      )
      const response = fixSt.get()
      if (response.xmlFault) {
        const code = response.xmlFault.code
        const description = response.xmlFault.description
        throw new SoapFaultError(
          `Fault ${code}: ${description}`,
          response.xmlFault
        )
      }
      return response
    }

    return await createProxy(client, purify, true)
  }
}

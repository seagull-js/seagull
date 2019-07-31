import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import fetch from 'node-fetch'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { SoapError } from '../error'
import { ClientFunction, createProxy, SoapClientSupplierBase } from './base'

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  /**
   * Creates a SOAP seed mode client.
   * @param options client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    try {
      const wsdl = await this.fetchWsdl(options)
      const seed = FixtureStorage.createByWsdlUrl(options.wsdlPath)
      seed.set(wsdl)
      const client = await this.getClientInternal<T>(options)
      const seedClient = await this.seedifyClient<T>(client, options.wsdlPath)
      return seedClient
    } catch (e) {
      throw new SoapError('Unable to create the SOAP seed mode client', e)
    }
  }

  private async seedifyClient<T extends soap.Client>(
    client: T,
    wsdlPath: string
  ) {
    const seedify = async (fnc: ClientFunction, name: string, args: any) => {
      const seed = FixtureStorage.createByUrl(
        `${wsdlPath}/${name}`,
        args,
        this.testScope
      )
      const resp = await fnc(args)
      seed.set(resp)
      return resp
    }
    return await createProxy(client, seedify)
  }

  private async fetchWsdl(options: ClientOptions, fetchFun = fetch) {
    const creds = options.credentials
    const headers = creds ? this.makeAuthHeader(creds) : {}
    const credentials = creds ? 'include' : undefined
    const init = { credentials, headers, method: 'GET', mode: 'cors' }
    return (await fetchFun(options.wsdlPath, init)).text()
  }

  private makeAuthHeader(credentials: Credentials) {
    const { username, password } = credentials
    const base64Creds = new Buffer(username + ':' + password).toString('base64')
    const Authorization = `Basic ${base64Creds}`
    return { Authorization }
  }
}

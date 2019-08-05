import { FixtureStorage as FxSt } from '@seagull/seed'
import * as fs from 'fs'
import { injectable } from 'inversify'
import fetch from 'node-fetch'
import 'reflect-metadata'
import { ClientOptions, Credentials, ISoapClient } from '..'
import { Http } from '../../../services-http/src/mode/cloud'
import { SoapError } from '../error'
import {
  ClientFunction,
  createProxy,
  getClientInternal,
  getEndpoint,
  SoapClientSupplierBase,
  wsdlIsFile,
} from './base'

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  /**
   * Creates a SOAP seed mode client.
   * @param opts client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(opts: ClientOptions): Promise<T> {
    try {
      const wsdl = await this.fetchWsdl(opts)
      const endpoint = getEndpoint(opts)
      if (!wsdlIsFile(opts)) {
        const seed = FxSt.createByWsdlUrl(endpoint)
        seed.set(wsdl)
      }
      const client = await getClientInternal<T>(opts)
      const seedClient = await this.seedifyClient<T>(client, endpoint)
      return seedClient
    } catch (e) {
      throw new SoapError(
        `Unable to create the SOAP seed mode client: ${e.message}`,
        e
      )
    }
  }

  private async seedifyClient<T extends ISoapClient>(
    client: T,
    endpoint: string
  ) {
    const seedify = async (fnc: ClientFunction, name: string, args: any) => {
      const seed = FxSt.createByUrl(`${endpoint}/${name}`, args, this.testScope)
      const resp = await fnc(args)
      seed.set(resp)
      return resp
    }
    return await createProxy(client, seedify, true)
  }

  private async fetchWsdl(opts: ClientOptions): Promise<string> {
    if (wsdlIsFile(opts)) {
      const wsdlString = fs.readFileSync(opts.wsdlPath, {
        encoding: 'utf-8',
      })
      return await Promise.resolve<string>(wsdlString)
    } else {
      const creds = opts.credentials
      const headers = creds ? this.makeAuthHeader(creds) : {}
      const credentials = creds ? 'include' : undefined
      const init = { credentials, headers, method: 'GET', mode: 'cors' }
      const wsdlString = await (await new Http().get(
        opts.wsdlPath,
        init
      )).text()
      return wsdlString
    }
  }

  private makeAuthHeader(credentials: Credentials) {
    const { username, password } = credentials
    const base64Creds = new Buffer(username + ':' + password).toString('base64')
    const Authorization = `Basic ${base64Creds}`
    return { Authorization }
  }
}

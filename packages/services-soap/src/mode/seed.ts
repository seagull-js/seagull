import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import fetch from 'node-fetch'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { ClientFunction, createProxy, SoapClientSupplierBase } from './base'

const makeAuthHeader = (credentials: Credentials) => {
  const { username, password } = credentials
  const base64Creds = new Buffer(username + ':' + password).toString('base64')
  const Authorization = `Basic ${base64Creds}`
  return { Authorization }
}

const fetchWsdl = async (options: ClientOptions, fetchFun = fetch) => {
  const creds = options.credentials
  const headers = creds ? makeAuthHeader(creds) : {}
  const credentials = creds ? 'include' : undefined
  const init = { credentials, headers, method: 'GET', mode: 'cors' }
  return (await fetchFun(options.wsdlPath, init)).text()
}

const seedifyClient = async <T extends soap.Client>(
  client: T,
  wsdlPath: string
) => {
  const seedify = async (fnc: ClientFunction, name: string, args: any) => {
    const seed = FixtureStorage.createByUrl(`${wsdlPath}/${name}`, args)
    const resp = await fnc(args)
    seed.set(resp)
    return resp
  }
  return await createProxy(client, seedify)
}

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const wsdl = await fetchWsdl(options)
    const seed = FixtureStorage.createByWsdlUrl(options.wsdlPath)
    seed.set(wsdl)
    const client = await this.getClientInternal<T>(options)
    // TODO: replace client generated functions with adapter doint the request and replacing the fixture
    return await seedifyClient<T>(client, options.wsdlPath)
  }
}

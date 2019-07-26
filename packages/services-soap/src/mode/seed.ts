import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import { flatMap, map } from 'lodash'
import fetch from 'node-fetch'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { SoapClientSupplierBase } from './base'

const makeAuthHeader = (credentials: Credentials) => {
  const { username, password } = credentials
  const base64Creds = new Buffer(username + ':' + password).toString('base64')
  const Authorization = `Basic ${base64Creds}`
  return { Authorization }
}

const fetchWSDL = async (options: ClientOptions, fetchFun = fetch) => {
  const creds = options.credentials
  const headers = creds ? makeAuthHeader(creds) : {}
  const credentials = creds ? 'include' : undefined
  const init = { credentials, headers, method: 'GET', mode: 'cors' }
  console.info(init)
  return (await fetchFun(options.wsdlPath, init)).text()
}

const seedifyClient = (client: soap.Client, wsdlPath: string) => {
  const asyncMeths: string[] = flatMap(client.wsdl.definitions.bindings, b =>
    Object.keys(b.topElements).map(meth => `${meth}Async`)
  )
  asyncMeths.forEach(meth => {
    const originalFunction = client[meth] as (...params: any[]) => any
    client[meth] = async (...params: any) => {
      const mSeed = FixtureStorage.createByUrl(`${wsdlPath}/${meth}`, params)
      const resp = await originalFunction(...params)
      mSeed.set(resp)
      return resp
    }
  })
  return client
}
/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const wsdl = await fetchWSDL(options)
    const seed = new FixtureStorage(
      options.wsdlPath
        .replace('http://', 'http/')
        .replace('https://', 'https/'),
      '.wsdl'
    )
    seed.set(wsdl)
    const client = await this.getClientInternal(options)
    // TODO: replace client generated functions with adapter doint the request and replacing the fixture
    return seedifyClient(client, options.wsdlPath) as T
  }
}

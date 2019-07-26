import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import { flatMap, map } from 'lodash'
import fetch from 'node-fetch'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { getAsyncMethods, SoapClientSupplierBase } from './base'

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
  return (await fetchFun(options.wsdlPath, init)).text()
}

const replaceMethod = (client: soap.Client, meth: string, wsdlPath: string) => {
  const originalFunction = client[meth] as (...params: any[]) => any
  client[meth] = async (...params: any) => {
    const seed = FixtureStorage.createByUrl(`${wsdlPath}/${meth}`, params)
    const resp = await originalFunction(...params)
    seed.set(resp)
    return resp
  }
}

const seedifyClient = (client: soap.Client, wsdlPath: string) => {
  const asyncMeths: string[] = getAsyncMethods(client)
  asyncMeths.forEach(meth => replaceMethod(client, meth, wsdlPath))
  return client
}

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const wsdl = await fetchWSDL(options)
    const seed = FixtureStorage.createByWsdlUrl(options.wsdlPath)
    seed.set(wsdl)
    const client = await this.getClientInternal(options)
    // TODO: replace client generated functions with adapter doint the request and replacing the fixture
    return seedifyClient(client, options.wsdlPath) as T
  }
}

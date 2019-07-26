import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import { flatMap, map } from 'lodash'
import fetch from 'node-fetch'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { SoapClientSupplierBase } from './base'

const replaceMethod = (client: soap.Client, meth: string, wsdlPath: string) => {
  client[meth] = async (...params: any) =>
    FixtureStorage.createByFetchParams(`${wsdlPath}/${meth}`, params).get()
}

const getAsyncMethods = (client: soap.Client) => {
  const { bindings } = client.wsdl.definitions
  return flatMap(bindings, b =>
    Object.keys(b.topElements).map(meth => `${meth}Async`)
  )
}

const purifyClient = (client: soap.Client, wsdlPath: string) => {
  const asyncMeths: string[] = getAsyncMethods(client)
  asyncMeths.forEach(meth => replaceMethod(client, meth, wsdlPath))
  return client
}
/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierPure extends SoapClientSupplierBase {
  async getClient<T extends soap.Client>(options: ClientOptions): Promise<T> {
    const wsdlPath = `seed/${options.wsdlPath}.wsdl`.replace('://', '/')
    const client = await this.getClientInternal({ ...options, wsdlPath })
    // TODO: replace client generated functions with adapter doint the request and replacing the fixture
    return purifyClient(client, options.wsdlPath) as T
  }
}

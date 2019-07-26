// tslint:disable:no-unused-expression
import { injectable } from 'inversify'
import * as _ from 'lodash'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'

export const makeAuthOptions = ({ username, password }: Credentials) => {
  const credString = username + ':' + password
  const Authorization = `Basic ${new Buffer(credString).toString('base64')}`
  return { wsdl_headers: { Authorization } }
}

export const setSecurity = (client: soap.Client, credentials: Credentials) => {
  const { username, password } = credentials
  client.setSecurity(new soap.BasicAuthSecurity(username, password))
}

export const getWsdlAsyncMethods = (client: soap.Client) => {
  const { bindings } = client.wsdl.definitions
  return _.flatMap(bindings, b =>
    Object.keys(b.topElements).map(meth => `${meth}Async`)
  )
}

export type ClientFunction = (args: any) => Promise<any>

export type ClientProxyFunction = (
  fnc: ClientFunction,
  name: string,
  args: any
) => Promise<any>

/**
 * Creates a proxy for a SOAP client.
 * @param client The SOAP client
 * @param proxyFunction The proxy function encapsulation
 */
export const createProxy = <T extends soap.Client>(
  client: T,
  proxyFunction: ClientProxyFunction
) => {
  const asyncMeths = getWsdlAsyncMethods(client)
  asyncMeths.forEach(name => {
    const original = client[name]
    ;(client as soap.Client)[name] = async (args: any) =>
      await proxyFunction(original as ClientFunction, name, args)
  })
  return client
}

@injectable()
export class SoapClientSupplierBase {
  protected async getClientInternal<T extends soap.Client>({
    wsdlPath,
    credentials,
    endpoint,
  }: ClientOptions): Promise<T> {
    const authOptions = credentials ? makeAuthOptions(credentials) : {}
    const defaultOptions = { rejectUnauthorized: false, strictSSL: false }
    const options = { endpoint: wsdlPath, ...defaultOptions, ...authOptions }
    const client: T = await soap.createClientAsync(wsdlPath, options)
    client.setEndpoint(endpoint || wsdlPath)
    credentials && setSecurity(client, credentials)
    return client
  }
}

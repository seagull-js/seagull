// tslint:disable:no-unused-expression
import { SeedableService } from '@seagull/seed'
import { injectable } from 'inversify'
import * as _ from 'lodash'
import 'reflect-metadata'
import * as soap from 'soap'
import { ClientOptions, Credentials } from '..'
import { config } from '../config'
import { SoapError } from '../error'

export type ClientFunction = (args: any) => Promise<any>

export type ClientProxyFunction = (
  fnc: ClientFunction,
  name: string,
  args: any
) => Promise<any>

/**
 * SoapResponse is a javascript array containing result, rawResponse,
 * soapheader, and rawRequest
 */
type SoapResponseArray = [
  /** result */
  any,
  /** rawResponse */
  string,
  /** soapheader */
  any,
  /** rawRequest */
  string
]

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
    Object.keys(b.methods).map(name => `${name}Async`)
  )
}

const proxifyClient = <T extends soap.Client>(
  client: T,
  name: string,
  proxyFunction: ClientProxyFunction
) => {
  const original = client[name] as ClientFunction
  const clientAsBase = client as soap.Client
  // note: hard to flatten because the async proxy function uses scope variables
  clientAsBase[name] = async (args: any) => {
    const array: SoapResponseArray = await proxyFunction(original, name, args)
    const response = Array.isArray(array) ? array[0] : array
    if (config.debug) {
      // note: safe because XML element names cannot start with the letters xml
      response.xmlRequest = array[1]
      response.xmlHeaders = array[2]
      response.xmlResponse = array[3]
    }
    return response
  }
}

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
  asyncMeths.forEach(name => proxifyClient(client, name, proxyFunction))
  return client
}

/**
 * Base SOAP client supplier.
 */
@injectable()
export class SoapClientSupplierBase extends SeedableService {
  /**
   * Creates a SOAP client using [node-soap](https://github.com/vpulim/node-soap).
   * @param param0 client options
   */
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

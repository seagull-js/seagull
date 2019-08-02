// tslint:disable:no-unused-expression
import { SeedableService } from '@seagull/seed'
import { injectable } from 'inversify'
import * as _ from 'lodash'
import 'reflect-metadata'
import { BasicAuthSecurity, createClientAsync } from 'soap'
import { ClientOptions, Credentials, ISoapClient } from '..'

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
  /** raw response */
  string,
  /** soap header */
  any,
  /** raw request */
  string
]

export const makeAuthOptions = ({ username, password }: Credentials) => {
  const credString = username + ':' + password
  const Authorization = `Basic ${new Buffer(credString).toString('base64')}`
  return { wsdl_headers: { Authorization } }
}

export const setSecurity = (client: ISoapClient, credentials: Credentials) => {
  const { username, password } = credentials
  client.setSecurity(new BasicAuthSecurity(username, password))
}

export const getWsdlAsyncMethods = (client: ISoapClient) => {
  const { bindings } = client.wsdl.definitions
  const functionNames = _.flatMap(bindings, b =>
    Object.keys(b.methods).map(name => `${name}Async`)
  )
  // note: node-soap actually combines all port definitions like this
  const uniqFunctionNames = _.uniq(functionNames)
  return uniqFunctionNames
}

const proxifyClient = <T extends ISoapClient>(
  client: T,
  name: string,
  proxyFunction: ClientProxyFunction,
  debug: boolean
) => {
  const original = client[name] as ClientFunction
  const clientAsBase = client as ISoapClient
  // note: hard to flatten because the async proxy function uses scope variables
  const genericProxyFunction = async (args: any) => {
    const array: SoapResponseArray = await original(args)
    const response = Array.isArray(array) ? array[0] : array
    // note: safe because XML element names cannot start with the letters xml
    if (debug) {
      response.xmlRequest = array[1]
      response.xmlHeaders = array[2]
      response.xmlResponse = array[3]
    }
    return response
  }
  clientAsBase[name] = async args =>
    proxyFunction(genericProxyFunction, name, args)
}

/**
 * Creates a proxy for a SOAP client.
 * @param client The SOAP client
 * @param proxyFunction The proxy function encapsulation
 */
export const createProxy = <T extends ISoapClient>(
  client: T,
  proxyFunction: ClientProxyFunction,
  debug: boolean
) => {
  const asyncMeths = getWsdlAsyncMethods(client)
  asyncMeths.forEach(name => proxifyClient(client, name, proxyFunction, debug))
  return client
}

export const getClientInternal = async <T extends ISoapClient>({
  credentials,
  endpoint,
  wsdlPath,
}: ClientOptions): Promise<T> => {
  const authOptions = credentials ? makeAuthOptions(credentials) : {}
  const defaultOptions = { rejectUnauthorized: false, strictSSL: false }
  const options = { endpoint: wsdlPath, ...defaultOptions, ...authOptions }
  const client: T = await createClientAsync(wsdlPath, options)
  client.setEndpoint(endpoint || wsdlPath)
  credentials && setSecurity(client, credentials)
  return client
}

/**
 * Base SOAP client supplier.
 */
@injectable()
export class SoapClientSupplierBase extends SeedableService {}

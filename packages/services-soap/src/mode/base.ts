import * as crypto from 'crypto'
import { injectable } from 'inversify'
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
    // tslint:disable-next-line:no-unused-expression
    credentials && setSecurity(client, credentials)
    return client
  }
}

import * as crypto from 'crypto'
import { injectable } from 'inversify'
import * as soap from 'soap'
export * from 'soap'
// hidden global singleton
const soapClients: { [key: string]: any } = {}

const createHash = (...args: any) => {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(args))
    .digest('hex')
}

// use singleton to avoid unnecessary async client creations
const createSoapClient = async (wsdlURI: string, opts?: soap.IOptions) => {
  const hash = createHash(wsdlURI, opts)
  soapClients[hash] =
    soapClients[hash] || (await soap.createClientAsync(wsdlURI, opts))
  return soapClients[hash]
}

@injectable()
export class SoapClientSupplier {
  async getClient<T extends soap.Client>(
    wsdlPath: string,
    username: string,
    password: string,
    endpoint?: string,
  ): Promise<T> {
    const creds = username + ':' + password
    const Authorization = `Basic ${new Buffer(creds).toString('base64')}`
    const defaultOptions = {
      rejectUnauthorized: false,
      strictSSL: false,
      wsdl_headers: { Authorization },
    }
    const options = { endpoint: wsdlPath, ...defaultOptions }
    const client: T = await createSoapClient(wsdlPath, options)
    client.setEndpoint(endpoint || wsdlPath)
    client.setSecurity(new soap.BasicAuthSecurity(username, password))
    return client
  }
}

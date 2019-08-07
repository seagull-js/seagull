import { Client } from 'soap'

export type Credentials = { username: string; password: string }

export interface ClientOptions {
  /** Where can I find the WSDL? Could be a file path or a URI */
  wsdlPath: string
  /** If set, an Authorization Header is sent when requesting the client */
  credentials?: Credentials
  /** If the actual endpoint differs from the WSDL path, assign a URI to this
   * Property */
  endpoint?: string
}

export interface ISoapClientSupplier {
  getClient<T extends ISoapClient>({
    wsdlPath,
    credentials,
    endpoint,
  }: ClientOptions): Promise<T>
}

export type ISoapClient = Client

export interface ISoapResponse {
  xmlHeaders: { [key: string]: string }
  xmlRequest: string
  xmlResponse: string
}

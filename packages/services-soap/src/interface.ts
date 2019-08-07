import { Client, ISoapFault, ISoapFault11, ISoapFault12 } from 'soap'

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
  xmlFault?: IXmlFault
  xmlHeaders: { [key: string]: string }
  xmlRequest: string
  xmlResponse: string
}

export interface IXmlFault {
  code: string | number
  subcode?: string
  description: string
  details?: string
  statusCode?: number
}

export type NodeSoapFault11 = ISoapFault11['Fault']
export type NodeSoapFault12 = ISoapFault12['Fault']

export interface NodeSoapFaultError {
  cause: {
    root: {
      Envelope: {
        Body: { Fault: NodeSoapFault11 | NodeSoapFault12 }
      }
    }
  }
  body: string
}

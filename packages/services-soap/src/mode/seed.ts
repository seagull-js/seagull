import { tryGet } from '@seagull/libraries'
import { FixtureStorage as FxSt } from '@seagull/seed'
import { Http } from '@seagull/services-http'
import * as fs from 'fs'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { SoapError, SoapFaultError } from '../error'
import {
  ClientOptions,
  Credentials,
  ISoapClient,
  ISoapResponse,
  IXmlFault,
  NodeSoapFault11,
  NodeSoapFault12,
  NodeSoapFaultError,
} from '../interface'
import {
  ClientFunction,
  createProxy,
  getClientInternal,
  getEndpoint,
  SoapClientSupplierBase,
  wsdlIsFile,
} from './base'

/**
 * Soap client supplier seed mode implementation.
 */
@injectable()
export class SoapClientSupplierSeed extends SoapClientSupplierBase {
  /**
   * Creates a SOAP seed mode client.
   * @param opts client options
   * @throws {SoapError} when unable to create the SOAP client
   */
  async getClient<T extends ISoapClient>(opts: ClientOptions): Promise<T> {
    try {
      const seed = await this.getWsdlSeed(opts)
      const endpoint = getEndpoint(opts)
      opts.wsdlPath = seed.path
      opts.endpoint = endpoint
      const client = await getClientInternal<T>(opts)
      const seedClient = await this.seedifyClient<T>(client, endpoint)
      return seedClient
    } catch (e) {
      throw new SoapError(
        `Unable to create the SOAP seed mode client: ${e.message}`,
        e
      )
    }
  }

  private async seedifyClient<T extends ISoapClient>(
    client: T,
    endpoint: string
  ) {
    const seedify = async (fnc: ClientFunction, name: string, args: any) => {
      const seed = FxSt.createByUrl<ISoapResponse>(
        `${endpoint}/${name}`,
        args,
        this.testScope
      )
      try {
        return this.getSeedResponse(seed, fnc, args)
      } catch (e) {
        this.handleResponseError(seed, e)
      }
    }
    return await createProxy(client, seedify, true)
  }

  private async getWsdlSeed(opts: ClientOptions): Promise<FxSt<string>> {
    const endpoint = getEndpoint(opts)
    const seed = FxSt.createByWsdlUrl<string>(endpoint)
    try {
      seed.get()
      if (seed.expired) {
        throw new Error()
      }
    } catch {
      const wsdlString = await this.getWsdl(opts)
      seed.set(wsdlString)
    }
    return seed
  }

  private async getSeedResponse(
    seed: FxSt<ISoapResponse>,
    fnc: ClientFunction,
    args: any
  ) {
    try {
      const response = seed.get()
      handleSeedError(response)
      return response
    } catch {
      try {
        const response = await fnc(args)
        seed.set(response)
        return response
      } catch (e) {
        this.handleResponseError(seed, e)
      }
    }
  }

  private async getWsdl(opts: ClientOptions): Promise<string> {
    return wsdlIsFile(opts) ? this.getWsdlLocal(opts) : this.fetchWsdl(opts)
  }

  private async getWsdlLocal(opts: ClientOptions): Promise<string> {
    const wsdlString = fs.readFileSync(opts.wsdlPath, {
      encoding: 'utf-8',
    })
    return await Promise.resolve<string>(wsdlString)
  }

  private async fetchWsdl(opts: ClientOptions): Promise<string> {
    const creds = opts.credentials
    const headers = creds ? this.getAuthHeader(creds) : {}
    const credentials = creds ? 'include' : undefined
    const init = { credentials, headers, method: 'GET', mode: 'cors' }
    const wsdlString = await (await new Http().get(opts.wsdlPath, init)).text()
    return wsdlString
  }

  private getAuthHeader(credentials: Credentials): { Authorization: string } {
    const { username, password } = credentials
    const base64Creds = new Buffer(username + ':' + password).toString('base64')
    const Authorization = `Basic ${base64Creds}`
    return { Authorization }
  }

  private handleResponseError(
    seed: FxSt<any>,
    error: NodeSoapFaultError | any
  ) {
    const fault: NodeSoapFault11 | NodeSoapFault12 = tryGet(
      error as NodeSoapFaultError,
      e => e.cause.root.Envelope.Body.Fault
    )
    if (fault) {
      const xmlFault: IXmlFault = this.convertFault(fault)
      const xmlResponse = (error as NodeSoapFaultError).body
      seed.set({ xmlFault, xmlResponse })
      throw new SoapFaultError(
        `Fault ${xmlFault.code}: ${xmlFault.description}`,
        xmlFault
      )
    }
    throw new SoapError('Unknown error', error)
  }

  private convertFault(fault: NodeSoapFault11 | NodeSoapFault12): IXmlFault {
    return 'Reason' in fault
      ? {
          code: unpack(fault.Code.Value),
          description: unpack(fault.Reason.Text),
          statusCode: unpack(fault.statusCode),
          subcode: unpack(fault.Code.Subcode && fault.Code.Subcode.Value),
        }
      : {
          code: unpack(fault.faultcode),
          description: unpack(fault.faultstring),
          details: unpack(fault.detail),
          statusCode: unpack(fault.statusCode),
        }
  }
}

export const handleSeedError = (response: ISoapResponse) => {
  if (response.xmlFault) {
    throw new SoapFaultError(
      `Fault ${response.xmlFault.code}: ${response.xmlFault.description}`,
      response.xmlFault
    )
  }
}

type $ValuePacked<T> = { $value: T }
const unpack = <T>(value: $ValuePacked<T> | T) => {
  return (!!value && (value as $ValuePacked<T>).$value) || (value as T)
}

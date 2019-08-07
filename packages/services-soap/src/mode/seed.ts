import { tryGet } from '@seagull/libraries'
import { FixtureStorage as FxSt } from '@seagull/seed'
import { Http } from '@seagull/services-http'
import * as fs from 'fs'
import { injectable } from 'inversify'
import 'reflect-metadata'
import {
  ClientOptions,
  Credentials,
  ISoapClient,
  ISoapResponse,
  IXmlFault,
  NodeSoapFault11,
  NodeSoapFault12,
  NodeSoapFaultError,
} from '..'
import { SoapError, SoapFaultError } from '../error'
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
      const wsdl = await this.fetchWsdl(opts)
      const endpoint = getEndpoint(opts)
      if (!wsdlIsFile(opts)) {
        const seed = FxSt.createByWsdlUrl(endpoint)
        seed.set(wsdl)
      }
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
        const resp = await fnc(args)
        seed.set(resp)
        return resp
      } catch (e) {
        this.handleError(seed, e)
      }
    }
    return await createProxy(client, seedify, true)
  }

  private handleError(seed: FxSt<any>, error: NodeSoapFaultError | any) {
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

  private async fetchWsdl(opts: ClientOptions): Promise<string> {
    if (wsdlIsFile(opts)) {
      const wsdlString = fs.readFileSync(opts.wsdlPath, {
        encoding: 'utf-8',
      })
      return await Promise.resolve<string>(wsdlString)
    } else {
      const creds = opts.credentials
      const headers = creds ? this.makeAuthHeader(creds) : {}
      const credentials = creds ? 'include' : undefined
      const init = { credentials, headers, method: 'GET', mode: 'cors' }
      const wsdlString = await (await new Http().get(
        opts.wsdlPath,
        init
      )).text()
      return wsdlString
    }
  }

  private makeAuthHeader(credentials: Credentials) {
    const { username, password } = credentials
    const base64Creds = new Buffer(username + ':' + password).toString('base64')
    const Authorization = `Basic ${base64Creds}`
    return { Authorization }
  }
}

type $ValuePacked<T> = { $value: T }
const unpack = <T>(value: $ValuePacked<T> | T) => {
  return (!!value && (value as $ValuePacked<T>).$value) || (value as T)
}

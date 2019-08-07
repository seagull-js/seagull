import { BasicError } from '@seagull/libraries'
import { ClientOptions, IXmlFault } from '.'

export class SoapError extends BasicError {
  /**
   * Creates a new SOAP error
   * @param message human readable error message
   * @param details soap client options or inner error object
   */
  constructor(message: string, public details?: ClientOptions | Error) {
    super('SoapError', message)
  }
}

export class SoapFaultError extends BasicError {
  /**
   * Creates a new SOAP fault error
   * @param message human readable error message
   * @param details soap client options or inner error object
   */
  constructor(message: string, public details: IXmlFault) {
    super('SoapFaultError', message)
  }
}

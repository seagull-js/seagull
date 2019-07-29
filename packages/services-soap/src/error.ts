import { BasicError } from '@seagull/libraries'
import { Response } from 'node-fetch'

export class SoapError extends BasicError {
  /**
   * Creates a new SOAP error
   * @param message human readable error message
   * @param details inner error or error details
   */
  constructor(message: string, public details: any) {
    super('SoapError', message)
  }
}

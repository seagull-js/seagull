import { BasicError } from '@seagull/libraries'
import { Response } from 'node-fetch'

export class HttpError extends BasicError {
  /**
   * Creates a new http error
   * @param message human readable error message
   * @param details fetch api response object
   */
  constructor(message: string, public details: Response) {
    super('HttpError', message)
  }
}

import { BasicError } from '@seagull/libraries'
import { Response } from 'node-fetch'

export class HttpError extends BasicError {
  constructor(message: string, public details: Response) {
    super('HttpError', message)
  }
}

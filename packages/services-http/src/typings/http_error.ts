import { Typings } from '@seagull/libraries'
import { Response } from 'node-fetch'

export interface HttpError extends Typings.BasicError {
  message: string
  details: Response
}

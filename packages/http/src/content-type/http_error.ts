import { Response } from 'node-fetch'

export interface HttpError extends Response {
  message: string
}

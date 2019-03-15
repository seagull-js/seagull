import { Response } from 'node-fetch'

export { HttpJson } from './json'

export interface HttpError extends Response {
  message: string
}

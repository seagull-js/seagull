import * as log from 'npmlog'
import { Stash } from './stash'

const stash = new Stash()

if (process.env.NODE_ENV === 'test') {
  ;(log as any).stream = stash
}

export function messages() {
  return stash.buffer
}

export function info(source: string, message: string, ...args: any[]) {
  log.info(`[${source}]`, message, args)
}

export function error(source: string, message: string, ...args: any[]) {
  log.error(`[${source}]`, message, args)
}

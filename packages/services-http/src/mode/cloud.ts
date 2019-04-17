import { injectable } from 'inversify'
import fetch, { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpBase } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export class Http extends HttpBase {
  /**
   * node-fetch
   * @see https://github.com/bitinn/node-fetch
   * @param url request url
   * @param init whatwg/fetch options
   */
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return await fetch(url, init)
  }
}

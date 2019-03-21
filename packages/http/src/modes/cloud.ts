import { injectable } from 'inversify'
import fetch, { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpBase } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export class Http extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return await fetch(url, init)
  }
}

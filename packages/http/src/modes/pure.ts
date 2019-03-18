import { Injectable } from 'injection-js'
import { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpBase } from '../base'
import { createResponse, Fixture } from '../seed/fixture'
import { SeedStorage } from '../seed/seedStorage'

/**
 * Http pure mode implementation.
 */
@Injectable()
export class HttpPure extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const seed = SeedStorage.createByRequest<Fixture>(url, init)
    const fixture = seed.get()
    if (!fixture) {
      throw new Error('Http: fixture (seed) is missing.')
    }
    if (seed.expired) {
      throw new Error('Http: fixture (seed) is expired.')
    }
    return createResponse(fixture)
  }
}

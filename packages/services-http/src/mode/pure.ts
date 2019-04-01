import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { createResponse, Fixture } from '../seed/fixture'
import { HttpBase } from './base'

/**
 * Http pure mode implementation.
 */
@injectable()
export class HttpPure extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const seed = FixtureStorage.createByFetchParams<Fixture<any>>(url, init)
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

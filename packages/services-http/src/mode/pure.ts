import { FixtureStorage, SeedError } from '@seagull/seed'
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
      throw new SeedError('Http: fixture (seed) is missing.', seed)
    }
    if (seed.expired) {
      throw new SeedError('Http: fixture (seed) is expired.', seed)
    }
    return createResponse(fixture)
  }
}

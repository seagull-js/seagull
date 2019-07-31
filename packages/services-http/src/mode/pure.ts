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
    const seed = FixtureStorage.createByUrl<Fixture<any>>(
      url,
      init,
      this.testScope
    )
    const fixture = seed.get()
    return createResponse(fixture)
  }
}

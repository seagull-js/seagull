import { FixtureStorage } from '@seagull/seed'
import { injectable } from 'inversify'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { createResponse, Fixture } from '../seed/fixture'
import { HttpBase } from './base'

export interface RequestException {
  body: NodeJS.ReadableStream
  headers: Headers
  message: string
  status: number
}

/**
 * Http seed mode implementation.
 */
@injectable()
export class HttpSeed extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const seed = FixtureStorage.createByFetchParams<Fixture<any>>(url, init)
    const seedFixture = seed.get()

    if (seedFixture && !seed.expired) {
      // seed exists => return seed
      return createResponse(seedFixture)
    }

    const res = await fetch(url, init)

    const fixture: Fixture<any> = {
      body: (await res.json()) || (await res.text()),
      options: {
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      },
    }

    seed.set(fixture)

    return createResponse(fixture)
  }
}

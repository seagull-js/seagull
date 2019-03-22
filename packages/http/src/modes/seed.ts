import { injectable } from 'inversify'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { createResponse, Fixture } from '../seed/fixture'
import { FixtureStorage } from '../seed/fixtureStorage'
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
    const seed = FixtureStorage.createByRequest<Fixture<any>>(url, init)
    const seedFixture = seed.get()

    if (seedFixture && !seed.expired) {
      // seed exists => return seed
      createResponse(seedFixture)
    }

    const res = await fetch(url, init)

    let fixture: Fixture<any> = {
      body: (await res.json()) || (await res.text()),
      options: {
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      },
    }

    if (seed.config.hook) {
      fixture = seed.config.hook(fixture)
    }

    seed.set(fixture)

    return createResponse(fixture)
  }
}

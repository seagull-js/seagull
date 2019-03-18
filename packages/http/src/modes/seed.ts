import { Injectable } from 'injection-js'
import fetch, { Headers, RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpBase } from '../base'
import { createResponse, Fixture } from '../seed/fixture'
import { SeedStorage } from '../seed/seedStorage'

export interface RequestException {
  body: NodeJS.ReadableStream
  headers: Headers
  message: string
  status: number
}

/**
 * Http seed mode implementation.
 */
@Injectable()
export class HttpSeed<T> extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    const seed = SeedStorage.createByRequest<Fixture>(url, init)
    const seedFixture = seed.get()
    const seedLocalHookConfig = seed.config

    if (seedFixture && !seed.expired) {
      // seed exists => return seed
      createResponse(seedFixture)
    }

    const res = await fetch(url, init)

    let fixture: Fixture = {
      body: (await res.json()) || (await res.text()),
      options: {
        headers: res.headers,
        status: res.status,
        statusText: res.statusText,
      },
    }

    if (seedLocalHookConfig.hook) {
      fixture = seedLocalHookConfig.hook(fixture)
    }

    // else if (Http.seedGlobalHookScript) {
    //   fixture = Http.seedGlobalHookScript<T>(fixture) || fixture
    // }

    seed.set(fixture)

    return createResponse(fixture)
  }
}

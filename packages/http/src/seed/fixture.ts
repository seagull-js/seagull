import { Response, ResponseInit } from 'node-fetch'

// TODO: make class
export interface Fixture {
  body: string | object
  options?: ResponseInit
}

// TODO: move to Fixture class
export const createResponse = (seedFixture: Fixture) => {
  if (typeof seedFixture.body !== 'string') {
    seedFixture.body = JSON.stringify(seedFixture.body)
  }
  return new Response(seedFixture.body, seedFixture.options)
}

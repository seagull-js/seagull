import { Response, ResponseInit } from 'node-fetch'

// TODO: make class
export interface Fixture<T> {
  body: T
  options?: ResponseInit
}

// TODO: move to Fixture class
export const createResponse = <T>(seedFixture: Fixture<T>) => {
  let bodyString
  if (typeof seedFixture.body !== 'string') {
    bodyString = JSON.stringify(seedFixture.body)
  } else {
    bodyString = seedFixture.body
  }
  return new Response(bodyString, seedFixture.options)
}

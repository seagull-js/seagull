import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import { e2e } from '../src/e2e'

@suite('Page::CustomData')
export class Test {
  @test
  async 'can render a DemoPage with custom data'() {
    await e2e()
  }
}

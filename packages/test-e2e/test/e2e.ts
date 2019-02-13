import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import * as stream from 'stream-buffers'
import { e2e } from '../src/e2e'
@suite('Page::CustomData')
export class Test {
  @test
  async 'can render a DemoPage with custom data'() {
    const stdout = new stream.WritableStreamBuffer()
    // tslint:disable-next-line:no-unused-expression
    ;(await e2e({stdout} as any)).should.be.true
    const stdoutContent = stdout.getContentsAsString('utf8')
    stdoutContent.should.contain('1 scenario (1 passed)')
    stdoutContent.should.contain('2 steps (2 passed)')
  }
}

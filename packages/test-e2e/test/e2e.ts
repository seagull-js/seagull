import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'
import * as stream from 'stream-buffers'
import { e2e } from '../src/e2e'
@suite('TestE2E::Simple e2e test')
export class Test {
  @test
  @timeout(30000)
  async 'cli picks ups scenarios and executes steps'() {
    const stdout = new stream.WritableStreamBuffer()
      // tslint:disable-next-line:no-unused-expression
    ;(await e2e({ stdout } as any)).should.be.true
    const stdoutContent = stdout.getContentsAsString('utf8')
    stdoutContent.should.contain('1 scenario (1 passed)')
    stdoutContent.should.contain('2 steps (2 passed)')
  }
}

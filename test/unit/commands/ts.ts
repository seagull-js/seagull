import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS, TS } from '../../../src/commands'
import { BasicTest } from '../../basic_test'

@suite('Unit::Commands::FS')
export class Test extends BasicTest {
  mocks = [new this.mock.FS('/tmp')]

  @test
  async 'CompileFile works'() {
    const content = 'export default {}'
    const fromPath = '/tmp/index.ts'
    const toPath = '/tmp/index.js'
    await new FS.WriteFile(fromPath, content).execute()
    await new TS.CompileFile(fromPath, toPath).execute()
    const file = await new FS.ReadFile(toPath).execute()
    file.should.contain('"use strict";')
  }

  @test
  async 'CompileFolder works'() {
    const content = 'export default {}'
    await new FS.WriteFile('/tmp/a/index.ts', content).execute()
    await new TS.CompileFolder('/tmp/a', '/tmp/b').execute()
    const file = await new FS.ReadFile('/tmp/b/index.js').execute()
    file.should.contain('"use strict";')
  }
}

import { FS } from '@seagull/commands-fs'
import { SetMode } from '@seagull/mode'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Bundle } from '../../src'

@suite('Bundle::Page')
export class Test extends BasicTest {
  async after() {
    await BasicTest.prototype.after.bind(this)()
    const del = new FS.DeleteFolder('/tmp/seagull-test')
    del.mode = { ...del.mode, environment: 'edge' }
    await del.execute()
  }

  @test
  @timeout(6000)
  async 'can transform a js file into "Page" UMD bundle'() {
    await new SetMode('environment', 'edge').execute()
    const writeTestFile = new FS.WriteFile(
      '/tmp/seagull-test/a.js',
      'module.exports = {}'
    )
    // writeTestFile.mode = { ...writeTestFile.mode, environment: 'edge' }
    await writeTestFile.execute()
    await new Bundle.Page(
      '/tmp/seagull-test/a.js',
      '/tmp/seagull-test/b.js'
    ).execute()
    const result = await new FS.ReadFile('/tmp/seagull-test/b.js').execute()
    result.should.be.a('string').that.is.not.equal('')
  }

  @test
  async 'can transform a js es6 file into polyfilled es5'() {
    await new SetMode('environment', 'edge').execute()
    const writeTestFile = new FS.WriteFile(
      '/tmp/seagull-test/a.js',
      'module.exports = {a:()=>3}'
    )
    await writeTestFile.execute()
    await new Bundle.Page(
      '/tmp/seagull-test/a.js',
      '/tmp/seagull-test/b.js'
    ).execute()
    const result = await new FS.ReadFile('/tmp/seagull-test/b.js').execute()
    result.should.contain('a: function a() {\n    return 3;\n  }')
  }
}

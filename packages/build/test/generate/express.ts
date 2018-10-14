import { FS } from '@seagull/commands'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Generate } from '../../src'

@suite('Generate::Express')
export class Test extends BasicTest {
  mocks = [new this.mock.FS('/tmp')]

  @test
  async 'can write an express.js boilerplate file'() {
    await new Generate.Express([], '/tmp/app.js').execute()
    const result = await new FS.ReadFile('/tmp/app.js').execute()
    result.should.be.a('string').that.is.not.equal('')
  }

  @test
  async 'can include route handlers'() {
    await new Generate.Express(['a.js'], '/tmp/app.js').execute()
    const result = await new FS.ReadFile('/tmp/app.js').execute()
    result.should.be.a('string').that.is.not.equal('')
    result.should.contain('require("./routes/a.js").default.register(app);')
  }
}

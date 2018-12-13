import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('S3::DeleteFile')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'Written Files can be deleted'() {
    await new S3.WriteFile('mybucket', 'index.html', 'content').execute()
    const file = await new S3.ReadFile('mybucket', 'index.html').execute()
    file.should.be.equal('content')
    await new S3.DeleteFile('mybucket', 'index.html').execute()
    const empty = await new S3.ReadFile('mybucket', 'index.html').execute()
    empty.should.be.equal('')
  }

  @test
  async 'DeleteFile can be reverted'() {
    const result = await new S3.DeleteFile('mybucket', 'index.html').revert()
      // tslint:disable-next-line:no-unused-expression
    ;(result === undefined).should.be.true
  }
}

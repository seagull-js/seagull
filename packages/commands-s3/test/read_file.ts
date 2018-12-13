import { S3 as S3Mock } from '@seagull/mock-s3'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('S3::ReadFile')
export class Test extends BasicTest {
  mocks = [new S3Mock()]

  @test
  async 'WriteFile and ReadFile work'() {
    const content = '<html />'
    await new S3.WriteFile('mybucket', 'index.html', content).execute()
    const file = await new S3.ReadFile('mybucket', 'index.html').execute()
    file.should.be.equal(content)
  }

  @test
  async 'ReadFile returns empty string (falsy) if target does not exist'() {
    const file = await new S3.ReadFile('mybucket', 'index.html').execute()
    file.should.be.equal('')
  }

  @test
  async 'revert method should be a no-op'() {
    const cmd = new S3.ReadFile('mybucket', '/tmp/index.html')
    await cmd.execute()
    const result = await cmd.revert()
    result.should.be.equal(true)
  }
}

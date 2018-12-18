import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('S3::WriteFile')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'WriteFile and ReadFile work'() {
    const content = '<html />'
    await new S3.WriteFile('mybucket', 'index.html', content).execute()
    const file = await new S3.ReadFile('mybucket', 'index.html').execute()
    file.should.be.equal(content)
  }

  @test
  async 'WriteFile can be reverted'() {
    const content = '<html />'
    const writer = new S3.WriteFile('mybucket', 'index.html', content)
    await writer.execute()
    await writer.revert()
    const reader = new S3.ReadFile('mybucket', 'index.html')
    const file = await reader.execute()
    file.should.be.equal('')
  }
}

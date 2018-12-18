import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('S3::ListFiles')
export class Test extends BasicTest {
  mocks = []

  @test
  async 'can read all files in a bucket'() {
    await new S3.WriteFile('mybucket', 'bundle.js', '').execute()
    await new S3.WriteFile('mybucket', 'index.html', '').execute()
    const list = await new S3.ListFiles('mybucket').execute()
    list.should.be.deep.equal(['bundle.js', 'index.html'])
  }

  @test
  async 'can read all files in a bucket with a prefix'() {
    await new S3.WriteFile('mybucket', 'assets/bundle.js', '').execute()
    await new S3.WriteFile('mybucket', 'index.html', '').execute()
    const list = await new S3.ListFiles('mybucket', 'assets').execute()
    list.should.be.deep.equal(['assets/bundle.js'])
  }

  @test
  async 'revert method should be a no-op'() {
    const cmd = new S3.ListFiles('mybucket')
    await cmd.execute()
    const result = await cmd.revert()
    ;(result === undefined).should.be.equal(true)
  }
}

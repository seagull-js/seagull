import { S3Sandbox } from '@seagull/commands-s3'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { config, Item } from '../src'

class Something extends Item {
  id: string = 'i18n'
}

@suite('config')
export class Test extends BasicTest {
  @test
  async 'name of the bucket is configurable'() {
    const storage = S3Sandbox.storage
    config.bucket.should.be.equal('demo-bucket')
    await Something.put({ id: '1' })
    storage['demo-bucket'].should.be.deep.equal({
      'Something/1.json': '{"id":"1"}',
    })
    config.bucket = 'another-bucket'
    await Something.put({ id: '1' })
    storage['another-bucket'].should.be.deep.equal({
      'Something/1.json': '{"id":"1"}',
    })
  }
}

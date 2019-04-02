import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3Pure } from '../src/mode/pure'
import { S3Seed } from '../src/mode/seed'

interface ExpectedResponse {
  args: {
    param1: string
    param2: string
  }
}

@suite('S3::Seed')
export class Test extends BasicTest {
  s3Seed = new S3Seed()
  s3Pure = new S3Pure()
  bucketName = 'test'
  fileName = `asdf.json`

  // TODO: Actually test S3 (at least once) instead of mock

  @test
  async 'can get seed fixture'() {
    // seed fixture
    await this.s3Seed.writeFile('mybucket', 'index.html', 'content')
    const seedResponse = await this.s3Seed.readFile('mybucket', 'index.html')
    expect(seedResponse).to.eq('content')

    // delete file
    await this.s3Seed.deleteFile('mybucket', 'index.html')

    // get from mem-fs-Sandbox
    const pureResponse = await this.s3Pure.readFile('mybucket', 'index.html')
    expect(pureResponse).to.eq('content')
  }

  // TODO: add writeFolder test
}

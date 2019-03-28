import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('S3::DeleteFile')
export class Test extends BasicTest {
  @test
  async TODO() {
    /** TODO: */
  }
}

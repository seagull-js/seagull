import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { DataStore } from '../../src/store/DataStore'
import { NetworkLayer } from '../../src/store/NetworkLayer'

@suite('DataStore')
export class AsyncFetchingTest extends BasicTest {
  @test
  @timeout(5000)
  async 'can be initialized'() {
    const datastore = new DataStore(
      { something: 'strange' },
      new NetworkLayer(() => {})
    )
    datastore.data.something.should.be.equal('strange')
  }
}

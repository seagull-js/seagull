import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'
import { chdir, cwd } from 'process'

@suite('Dispatching Jobs Works')
class DispatchTests {
  @test
  async 'dispatching real lambda calls works'() {
    const event = {}
    const api = require(join(__dirname, 'example', 'Job.js')).handler()
    const response: any = await new Promise((resolve, reject) => {
      api(event, null, (error, result) => {
        error ? reject(error) : resolve(result)
      })
    })
  }
}

import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

import generate from '../../lib/serverless/generate-yaml'

@suite()
class ServerlessYaml {
  @test('can generate a serverless.yml in memory')
  public canGenerateYamlInMemory() {
    const yml = generate({ name: 'demoSLS' })
    expect(yml).to.include('aws')
    expect(yml).to.include('runtime: nodejs6.10')
  }
}

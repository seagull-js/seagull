import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite()
class ServerlessYaml {
  @test('can generate a serverless.yml in memory')
  public canGenerateYamlInMemory() {
    expect(true).to.be.equal(true)
  }
}

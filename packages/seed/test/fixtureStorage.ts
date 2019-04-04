import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FixtureStorage } from '../src'

@suite('Seed::FixtureStorage')
export class Test {
  @test
  async 'can create fixture storage'() {
    new FixtureStorage<string>('../seed/something', '.json')
  }
}

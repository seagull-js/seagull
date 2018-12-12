import { Mock } from '@seagull/mock'
import { SetMode } from '@seagull/mode'
import * as MockImplementations from './mocks'

export class BasicTest {
  /**
   * Supply a correct list of all Mock implementations for test class users
   */
  mock = MockImplementations

  /**
   * fill in yourself what you want to have mocked with MockImplementation
   * instances, use `this.mock` as shortcut to aa list of all implementations
   */
  mocks: Mock[] = []

  /**
   * before every test, activate all given mocks
   */
  before() {
    new SetMode('environment', 'pure').execute()
    this.mocks.forEach(mock => mock.activate())
  }

  /**
   * after every test, deactivate all mocks in reverse order
   */
  after() {
    this.mocks.reverse().forEach(mock => mock.deactivate())
  }
}

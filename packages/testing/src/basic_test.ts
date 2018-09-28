import * as MockImplementations from '../src/mocks'
import { Mock } from '../src/mocks'

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
    this.mocks.forEach(mock => mock.activate())
  }

  /**
   * after every test, deactivate all mocks in reverse order
   */
  after() {
    this.mocks.reverse().forEach(mock => mock.deactivate())
  }
}

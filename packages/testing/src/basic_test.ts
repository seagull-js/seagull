import { Mock } from '@seagull/mock'
import { SetMode } from '@seagull/mode'
import { Sandbox } from '@seagull/sandbox'

export class BasicTest {
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
    Sandbox.reset()
  }

  /**
   * after every test, deactivate all mocks in reverse order
   */
  after() {
    this.mocks.reverse().forEach(mock => mock.deactivate())
  }
}

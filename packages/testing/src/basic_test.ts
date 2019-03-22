import { Mock } from '@seagull/mock'
import { SetMode } from '@seagull/mode'
import { Sandbox } from '@seagull/sandbox'

export abstract class BasicTest {
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

    // call beforeEach hook
    if (typeof (this as any).beforeEach === 'function') {
      ;(this as any).beforeEach()
    }
  }

  /**
   * after every test, deactivate all mocks in reverse order
   */
  after() {
    this.mocks.reverse().forEach(mock => mock.deactivate())

    // call afterEach hook
    if (typeof (this as any).afterEach === 'function') {
      ;(this as any).afterEach()
    }
  }
}

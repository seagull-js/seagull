import * as mockFS from 'mock-fs'
import * as mockRequire from 'mock-require'

/**
 * Implements common functionality that will be used across all tests.
 */
export default class BaseTest {
  /**
   * mock a folder path with MockFS. Require-ing files from mocked locactions
   * can't load from non-mocked locations (like node_modules), so require things
   * before you mock folders.
   */
  mockFolder = (path: string) => mockFS({ [path]: {} })

  /**
   * mock all calls to @seagull/framework
   */
  mockRequire = () => mockRequire('@seagull/framework', '../../src/core/index')

  /**
   * resets all mocking done by [[mockFolder]]. use after test is done.
   */
  restoreFolder = () => mockFS.restore()
}

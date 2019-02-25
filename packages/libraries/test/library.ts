import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { getAppName, Library, memoize } from '../src'

class TestLib extends Library {
  static double(num: number) {
    return num * 2
  }

  @memoize()
  static triple(num: number) {
    return num * 3
  }

  @memoize()
  static generate() {
    return { some: 'data' }
  }
}

@suite('Library')
export class Test {
  @test
  async 'can be subclassed and methods decorated'() {
    TestLib.double(1).should.be.equal(2)
    TestLib.triple(1).should.be.equal(3)
    const firstObject = TestLib.generate()
    const secondObject = TestLib.generate()
    firstObject.should.be.deep.equal(secondObject)
  }

  @test
  async 'can get app name'() {
    const appName = getAppName()
    appName.should.be.equal('@seagull/libraries')
  }
}

import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Library } from '../src'

class TestLib extends Library {
  static double(num: number) {
    return num * 2
  }

  @Library.memoize()
  static triple(num: number) {
    return num * 3
  }

  @Library.memoize()
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
}

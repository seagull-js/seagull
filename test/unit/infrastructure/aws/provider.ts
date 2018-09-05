import { Provider } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite('Unit::Infrastructure::AWS::Provider')
class Test {
  @test
  'can be instantiated'() {
    const cf = new Provider('some text')
    cf.should.be.an('object')
  }

  @test
  'can transform into resources template object'() {
    const cf = new Provider('some text')
    cf.description.should.be.equal('some text')
  }
}

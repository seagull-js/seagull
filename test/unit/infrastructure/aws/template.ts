import { Template } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Unit from '../../../helper/functional_test'

@suite('Unit::Infrastructure::AWS::Template')
class Test {
  @test
  'can be instantiated'() {
    const cf = new Template('some name', 'some text')
    cf.should.be.an('object')
  }

  @test
  'can transform into resources template object'() {
    const cf = new Template('some name', 'some text')
    cf.service.should.be.equal('some name')
    cf.provider.should.be.an('object')
    cf.provider.description.should.be.equal('some text')
  }
}

import { Template } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Unit from '../../../helper/functional_test'

@suite('Unit::Infrastructure::AWS::Template')
class Test {
  @test
  'can be instantiated'() {
    const tpl = new Template('name', 'some text', 'id')
    tpl.should.be.an('object')
  }

  @test
  'can transform into resources template object'() {
    const tpl = new Template('name', 'some text', 'id')
    tpl.service.should.be.equal('name')
    tpl.provider.should.be.an('object')
    tpl.provider.description.should.be.equal('some text')
    tpl.resources.should.be.an('object')
  }
}

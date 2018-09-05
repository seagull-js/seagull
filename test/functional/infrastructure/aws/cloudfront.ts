import { CloudFront } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Infrastructure::AWS::Cloudfront')
class Test extends FunctionalTest {
  @test
  'can be instantiated'() {
    const cf = new CloudFront('demoApp', '1234', ['example.com'])
    cf.should.be.an('object')
  }

  @test
  'can transform into resources template object'() {
    const cf = new CloudFront('demoApp', '1234', ['example.com'])
    cf.resources.should.be.an('object')
  }
}

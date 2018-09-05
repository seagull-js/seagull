import { CloudFront } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite('Unit::Infrastructure::AWS::Cloudfront')
class Test {
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

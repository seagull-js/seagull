import { S3 } from '@infrastructure/aws'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite('Unit::Infrastructure::AWS::S3')
class Test {
  @test
  'can be instantiated'() {
    const meta = new S3('demoApp', '1234', 'accessId')
    meta.should.be.an('object')
  }

  @test
  'can transform into resources template object'() {
    const meta = new S3('demoApp', '1234', 'accessId')
    meta.resources.should.be.an('object')
    const { appBucket, appBucketPermission } = meta.resources
    appBucket.should.be.an('object')
    appBucket.Type.should.be.equal('AWS::S3::Bucket')
    appBucket.Properties.should.be.an('object')
    appBucketPermission.should.be.an('object')
    appBucketPermission.Type.should.be.equal('AWS::S3::BucketPolicy')
    appBucketPermission.Properties.should.be.an('object')
  }
}

import { DeployToAWS } from '@deploy'
import { AppPlan } from '@scaffold/plans'
import { listFiles } from '@tools/util'
import * as AWS from 'aws-sdk'
import * as AWSMock from 'aws-sdk-mock'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../helper/functional_test'

@suite('Integration::Deploy::AWS')
export class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
    const callback = (cb: any) => cb(null, { Account: 'A' })
    // tslint:disable-next-line:no-unused-expression
    new AWS.STS() // must load spec from disc at least once
    AWSMock.mock('STS', 'getCallerIdentity', callback)
  }
  after() {
    delete process.env.AWS_PROFILE
    this.restoreFolder()
    AWSMock.restore()
  }

  @test
  async 'creates serverless.yml file in deploy folder'() {
    const appPlan = new AppPlan('/tmp', 'DemoApp', 'static')
    appPlan.apply()
    const deployCommand = new DeployToAWS('/tmp/DemoApp')
    await deployCommand.run()
    const files = listFiles('/tmp/DemoApp/.seagull')
    files.should.include('/tmp/DemoApp/.seagull/serverless.yml')
    const sls = fs.readFileSync('/tmp/DemoApp/.seagull/serverless.yml', 'utf-8')
    sls.should.include('DemoApp')
  }
}

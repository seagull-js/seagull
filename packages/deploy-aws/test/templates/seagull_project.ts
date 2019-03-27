import { BasicTest } from '@seagull/testing'
import { DistributionSummary } from 'aws-sdk/clients/cloudfront'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { FS } from '@seagull/commands-fs'

import { SeagullProject } from '../../src'
import * as Handlers from '../../src/aws_sdk_handler'

@suite('SeagullProject')
export class Test extends BasicTest {
  appPath = `${process.cwd()}/test_data`
  async before() {
    await BasicTest.prototype.before.bind(this)()
    process.env.AWS_REGION = 'eu-central-1'
    const assetFolder = `${this.appPath}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(
      `${this.appPath}/dist/cron.json`,
      JSON.stringify([])
    ).execute()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create a project'() {
    const props = {
      appPath: this.appPath,
      branch: 'master',
      githubToken: 'Token123',
      handlers: {
        acmHandler: new TestACMHandler(),
        cloudfrontHandler: new TestCloudfrontHandler(),
        stsHandler: new TestSTSHandler(),
      },
      mode: 'prod',
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
    }
    const project = await new SeagullProject(props).createSeagullApp()
    const synthStack = project.synthesizeStack('helloworld')
    Object.keys(synthStack.template.Resources).length.should.be.above(1)
  }
}

class TestACMHandler extends Handlers.ACMHandler {
  private arnsWithDomains: { [arn: string]: string[] }

  constructor(testData?: { [arn: string]: string[] }) {
    super()
    this.arnsWithDomains = testData || { arn1: ['www.aida.de', 'www2.aida.de'] }
  }

  async listCertificates() {
    return Object.keys(this.arnsWithDomains)
  }

  async describeCertificate(acmCertRef: string) {
    return this.arnsWithDomains[acmCertRef] || []
  }
}

class TestCloudfrontHandler extends Handlers.CloudfrontHandler {
  private cloudfrontList: Array<{ Comment: string; DomainName: string }>

  constructor(testData?: Array<{ Comment: string; DomainName: string }>) {
    super()
    const defaultData = [{ Comment: 'helloworld', DomainName: 'abcdef.cf.net' }]
    this.cloudfrontList = testData || defaultData
  }

  async listDistributions() {
    return this.cloudfrontList as DistributionSummary[]
  }
}

class TestSTSHandler extends Handlers.STSHandler {
  private accountId: string

  constructor(testAccount?: string) {
    super()
    this.accountId = testAccount || 'test-account-id'
  }

  async getAccountId() {
    return this.accountId
  }
}

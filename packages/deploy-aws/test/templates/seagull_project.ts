import { PolicyStatement, Role } from '@aws-cdk/aws-iam'
import { FS } from '@seagull/commands-fs'
import { BasicTest } from '@seagull/testing'
import { DistributionSummary } from 'aws-sdk/clients/cloudfront'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import 'chai/register-should'
import { cloneDeep, find } from 'lodash'
import { suite, test } from 'mocha-typescript'
import { SeagullApp, SeagullProject } from '../../src'
import * as Handlers from '../../src/aws_sdk_handler'
import { isInList } from '../test-helper/template_searching'
use(promisedChai)

const s3Name = 'another-s3'
const customizationCode = `import { SeagullApp } from '../src'
export default function(app: SeagullApp) {
  app.stack.addS3('another-s3', app.role)
}`
const customizeAsync = `import { SeagullApp } from '../../src'
export default async function(app: SeagullApp) {
  await new Promise(resolve => {
    const addS3Async = () => {
      app.stack.addS3('another-s3', app.role)
      resolve()
    }
    setTimeout(addS3Async, 50)
  })
}`
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
    const props = getTestProps(this.appPath)

    const project = await new SeagullProject(props).createSeagullApp()
    const synthStack = project.synthesizeStack('helloworld')

    Object.keys(synthStack.template.Resources).length.should.be.above(1)
  }

  @test
  async 'assigns a default role to role property of SeagullApp'() {
    const props = getTestProps(this.appPath)

    const app = await new SeagullProject(props).createSeagullApp()

    expect(app.role).to.be.instanceOf(Role)
  }

  @test
  async 'can add policies after creating SeagullApp'() {
    const props = getTestProps(this.appPath)

    const app = await new SeagullProject(props).createSeagullApp()
    const stmt = new PolicyStatement().addAllResources().addAction('action3')
    app.role!.addToPolicy(stmt)
    const synth = app.synthesizeStack('helloworld')
    const newPolicyCriterion = resourceHasNewAction('action3')
    const hasNewPolicy = !!find(synth.template.Resources, newPolicyCriterion)
    hasNewPolicy.should.be.equal(true)
  }

  @test
  async 'adds the right lambda'() {
    const props = getTestProps(this.appPath)

    const project = await new SeagullProject(props).createSeagullApp()
    const synthStack = project.synthesizeStack('helloworld')

    const lambdaFnKey = Object.keys(synthStack.template.Resources).filter(
      key => synthStack.template.Resources[key].Type === 'AWS::Lambda::Function'
    )
    expect(lambdaFnKey.length).to.equal(1)
    const lambdaFn = synthStack.template.Resources[lambdaFnKey[0]]
    // tslint:disable-next-line:no-unused-expression
    expect(lambdaFn.Properties).to.have.property('Environment')
    const expectedEnv = {
      APP: 'helloworld',
      LOG_BUCKET: 'eu-central-1-test-account-id-helloworld-master-logs',
      MODE: 'cloud',
      NODE_ENV: 'production',
      STAGE: 'prod',
    }
    expect(lambdaFn.Properties.Environment.Variables).to.deep.equal(expectedEnv)
  }

  @test
  async 'can create a project and customize stack'() {
    const props = getTestProps(this.appPath)
    await writeCustomInfraFile(this.appPath)

    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()
    const stackName = 'helloworld'
    await project.customizeStack(app)
    const synthStack = app.synthesizeStack(stackName)

    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)
    await deleteCustomInfra(this.appPath)
  }

  /** This test needs to use another directory, because imports are cached
   * and here the import of infrastructure-aws.ts needs to be something
   * other than the infrastructure-aws.ts above */
  @test
  async 'can create a project and customize stack asynchronously'() {
    const newCWD = `${this.appPath}/async-customization`
    const assetFolder = `${newCWD}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(`${newCWD}/dist/cron.json`, '[]').execute()
    await writeCustomInfraFile(newCWD, customizeAsync)
    const props = getTestProps(newCWD)

    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()
    const stackName = 'helloworld'
    await project.customizeStack(app)
    const synthStack = app.synthesizeStack(stackName)

    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)
    await deleteCustomInfra(newCWD)
  }

  /** This test needs to use another directory, because imports are cached
   * and here the import of infrastructure-aws.ts needs to be something
   * other than the infrastructure-aws.ts above */
  @test
  async 'customize stack throws when infrastructure-aws.ts is corrupted'() {
    const newCWD = `${this.appPath}/corrupted-infrastructure`
    const assetFolder = `${newCWD}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(`${newCWD}/dist/cron.json`, '[]').execute()
    await writeCustomInfraFile(newCWD, 'export default 123')
    const props = getTestProps(newCWD)

    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()

    const customize = () => project.customizeStack(app)
    await expect(customize()).to.be.rejectedWith(Error)
    await deleteCustomInfra(newCWD)
  }

  @test
  async 'customizeStack should do nothing but return false without an infrastructure-aws.ts-file'() {
    const props = getTestProps(this.appPath)

    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()
    const appBeforeCustomization = cloneDeep(app)
    const returnValue = await project.customizeStack(app)

    expect(app).to.deep.equal(appBeforeCustomization)
    expect(returnValue).to.be.equal(false)
  }

  @test
  async 'can deploy a project without customized stack'() {
    const props = getTestProps(this.appPath)
    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const deployStack = () => (hasBeenCalled = true)
    project.createSeagullApp = () =>
      Promise.resolve(({ deployStack } as unknown) as SeagullApp)

    await project.deployProject()

    expect(hasBeenCalled).to.be.equal(true)
  }

  @test
  async 'can deploy a project with customized stack'() {
    await writeCustomInfraFile(this.appPath)
    const props = getTestProps(this.appPath)

    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const deployStack = async () => {
      hasBeenCalled = true
    }
    const createSeagullApp = project.createSeagullApp
    let app: SeagullApp
    project.createSeagullApp = async () => {
      app = await createSeagullApp.bind(project)()
      app.deployStack = deployStack
      return app
    }
    // project.createSeagullApp.bind(project)
    const stackName = 'helloworld'

    await project.deployProject()

    const synthStack = app!.synthesizeStack(stackName)
    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)

    hasBeenCalled.should.be.equal(true)
    await deleteCustomInfra(this.appPath)
  }

  @test
  async 'can diff a project without customized stack'() {
    const props = getTestProps(this.appPath)
    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const diffStack = () => (hasBeenCalled = true)
    project.createSeagullApp = () =>
      Promise.resolve(({ diffStack } as unknown) as SeagullApp)

    await project.diffProject()

    expect(hasBeenCalled).to.be.equal(true)
  }

  @test
  async 'can diff a project with customized stack'() {
    await writeCustomInfraFile(this.appPath)
    const props = getTestProps(this.appPath)

    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const diffStack = async () => {
      hasBeenCalled = true
    }
    const createSeagullApp = project.createSeagullApp
    let app: SeagullApp
    project.createSeagullApp = async () => {
      app = await createSeagullApp.bind(project)()
      app.diffStack = diffStack
      return app
    }
    const stackName = 'helloworld'

    await project.diffProject()

    const synthStack = app!.synthesizeStack(stackName)
    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)

    hasBeenCalled.should.be.equal(true)
    await deleteCustomInfra(this.appPath)
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

const getTestProps = (appPath: string) => ({
  account: '1234567890',
  appPath,
  branch: 'master',
  githubToken: 'Token123',
  handlers: {
    acmHandler: new TestACMHandler(),
    cloudfrontHandler: new TestCloudfrontHandler(),
    stsHandler: new TestSTSHandler(),
  },
  owner: 'me',
  profile: 'default',
  region: 'eu-central-1',
  repository: 'test-repo',
  stage: 'prod',
})

const deleteCustomInfra = async (appPath: string) => {
  const customInfraDel = new FS.DeleteFile(`${appPath}/infrastructure-aws.ts`)
  await customInfraDel.execute()
  customInfraDel.mode = { environment: 'edge' }
  await customInfraDel.execute()
}

const writeCustomInfraFile = async (
  appPath: string,
  code = customizationCode
) => {
  const customizationPath = `${appPath}/infrastructure-aws.ts`
  const customInfraGen = new FS.WriteFile(customizationPath, code)
  await customInfraGen.execute()
  customInfraGen.mode = { environment: 'edge' }
  await customInfraGen.execute()
}

const resPropHasNewAction = (action: string) => (resProp: any) =>
  !!resProp.Statement &&
  !!find(resProp.Statement, (s: any) => s.Action.includes(action))

const resourceHasNewAction = (action: string) => (res: any) =>
  !!find(res.Properties, resPropHasNewAction(action))
